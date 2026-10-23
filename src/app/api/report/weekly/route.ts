import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    const watchlist = await db.watchlistEntry.findMany({
      where: { userId: user.id },
      include: {
        findings: true,
        verifications: true,
      },
    });

    const projects = await db.project.findMany({
      where: { userId: user.id },
      include: {
        dependencies: {
          include: { findings: true },
        },
      },
    });

    const allFindings = [
      ...watchlist.flatMap((w) => w.findings),
      ...projects.flatMap((p) => p.dependencies.flatMap((d) => d.findings)),
    ];

    const confirmed = allFindings.filter((f) => f.status === "CONFIRMED_AFFECTED");
    const urgent = allFindings.filter((f) => f.priority === "FIX_URGENTLY" && f.status === "CONFIRMED_AFFECTED");
    const verifiedFixed = allFindings.filter((f) => f.status === "VERIFIED_FIXED");
    const needsVerification = allFindings.filter((f) => f.status === "NEEDS_VERIFICATION");

    const totalMonitoredSoftware = watchlist.length;
    const totalProjects = projects.length;
    const totalDependencies = projects.reduce((acc, p) => acc + p.totalDependencies, 0);

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        mode: user.mode,
      },
      metrics: {
        totalMonitoredSoftware,
        totalProjects,
        totalDependencies,
        urgentCount: urgent.length,
        confirmedVulnerabilities: confirmed.length,
        verifiedFixedCount: verifiedFixed.length,
        needsVerificationCount: needsVerification.length,
      },
      watchlistSummary: watchlist.map((w) => ({
        id: w.id,
        name: w.name,
        ecosystem: w.ecosystem,
        version: w.currentVersion,
        activeFindings: w.findings.filter((f) => f.status === "CONFIRMED_AFFECTED").length,
        lastChecked: w.lastCheckedAt,
      })),
      recentVerifications: watchlist
        .flatMap((w) => w.verifications)
        .slice(0, 5),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
