import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-helper";
import { queryOSV } from "@/lib/services/osv-service";
import { enrichAdvisory } from "@/lib/services/vulnerability-intel";
import { FindingStatus, PriorityLevel } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const watchlist = await db.watchlistEntry.findMany({
      where: { userId: user.id },
      include: {
        findings: {
          orderBy: { detectedAt: "desc" },
        },
        verifications: {
          orderBy: { verifiedAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ watchlist });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const body = await req.json();
    const { name, ecosystem, currentVersion, platform } = body;

    if (!name || !ecosystem || !currentVersion) {
      return NextResponse.json(
        { error: "name, ecosystem, and currentVersion are required" },
        { status: 400 }
      );
    }

    // Create watchlist entry
    const entry = await db.watchlistEntry.create({
      data: {
        userId: user.id,
        name: name.trim(),
        ecosystem: ecosystem.trim(),
        currentVersion: currentVersion.trim(),
        platform: platform || "Desktop",
      },
    });

    // Run real-time check and persist findings
    try {
      const raw = await queryOSV(entry.name, entry.ecosystem, entry.currentVersion);
      const enriched = (raw.vulns || []).map((advisory) =>
        enrichAdvisory(advisory, entry.name, entry.currentVersion)
      );

      for (const f of enriched) {
        await db.vulnerabilityFinding.create({
          data: {
            watchlistEntryId: entry.id,
            advisoryId: f.advisoryId,
            aliases: f.aliases,
            title: f.title,
            summary: f.summary,
            severity: f.severity,
            cvssScore: f.cvssScore,
            epssScore: f.epssScore,
            isKev: f.isKev,
            priority: f.priority as PriorityLevel,
            affectedRange: f.affectedRange,
            fixedVersion: f.recommendedFix,
            status: f.applicability as FindingStatus,
            sourceUrl: f.sourceUrl,
          },
        });
      }
    } catch {
      // Continue even if OSV temporarily fails; findings can be refreshed later
    }

    const updatedEntry = await db.watchlistEntry.findUnique({
      where: { id: entry.id },
      include: { findings: true, verifications: true },
    });

    return NextResponse.json({ entry: updatedEntry }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Watchlist entry id is required" }, { status: 400 });
    }

    // Ensure user isolation: verify ownership
    const entry = await db.watchlistEntry.findFirst({
      where: { id, userId: user.id },
    });

    if (!entry) {
      return NextResponse.json({ error: "Watchlist entry not found" }, { status: 404 });
    }

    await db.watchlistEntry.delete({ where: { id } });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
