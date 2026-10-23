import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";
import { parseDependencyFile } from "@/lib/services/dependency-parser";
import { queryOSVBatch } from "@/lib/services/osv-service";
import { enrichAdvisory } from "@/lib/services/vulnerability-intel";
import { FindingStatus, PriorityLevel } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const body = await req.json();
    const { filename, content, projectName } = body;

    if (!filename || !content) {
      return NextResponse.json(
        { error: "filename and content are required for dependency import" },
        { status: 400 }
      );
    }

    // 1. Strictly parse dependency file
    const parsed = parseDependencyFile(filename, content);
    const name = projectName || filename.replace(/\.[^/.]+$/, "");

    // 2. Create Project in DB
    const project = await db.project.create({
      data: {
        userId: user.id,
        name,
        ecosystem: parsed.detectedEcosystem,
        sourceFilename: filename,
        totalDependencies: parsed.dependencies.length,
      },
    });

    // 3. Batch query OSV
    const batchItems = parsed.dependencies.map((d) => ({
      name: d.name,
      ecosystem: d.ecosystem,
      version: d.version,
    }));

    let batchResults: Array<{ item: { name: string; ecosystem: string; version?: string }; vulns: any[] }> = [];
    try {
      batchResults = await queryOSVBatch(batchItems);
    } catch (e: any) {
      console.warn("Batch OSV scan encountered partial error:", e.message);
    }

    let totalVulnerable = 0;

    // 4. Save dependencies and their findings in DB
    for (let i = 0; i < parsed.dependencies.length; i++) {
      const dep = parsed.dependencies[i];
      const depRecord = await db.projectDependency.create({
        data: {
          projectId: project.id,
          name: dep.name,
          version: dep.version,
          isDirect: dep.isDirect,
          ecosystem: dep.ecosystem,
        },
      });

      const matchedBatch = batchResults[i];
      const vulns = matchedBatch?.vulns || [];
      if (vulns.length > 0) {
        totalVulnerable++;
        for (const rawAdvisory of vulns) {
          const enriched = enrichAdvisory(rawAdvisory, dep.name, dep.version);
          await db.vulnerabilityFinding.create({
            data: {
              projectDependencyId: depRecord.id,
              advisoryId: enriched.advisoryId,
              aliases: enriched.aliases,
              title: enriched.title,
              summary: enriched.summary,
              severity: enriched.severity,
              cvssScore: enriched.cvssScore,
              epssScore: enriched.epssScore,
              isKev: enriched.isKev,
              priority: enriched.priority as PriorityLevel,
              affectedRange: enriched.affectedRange,
              fixedVersion: enriched.recommendedFix,
              status: enriched.applicability as FindingStatus,
              sourceUrl: enriched.sourceUrl,
            },
          });
        }
      }
    }

    // Update project total vulnerable count
    const updatedProject = await db.project.update({
      where: { id: project.id },
      data: {
        vulnerableCount: totalVulnerable,
        lastScannedAt: new Date(),
      },
      include: {
        dependencies: {
          include: { findings: true },
        },
      },
    });

    return NextResponse.json({
      project: updatedProject,
      warnings: parsed.warnings,
      parsedSummary: {
        totalDependencies: parsed.totalParsed,
        vulnerableDependencies: totalVulnerable,
        detectedEcosystem: parsed.detectedEcosystem,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
