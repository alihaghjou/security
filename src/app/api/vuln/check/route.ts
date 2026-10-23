import { NextRequest, NextResponse } from "next/server";
import { queryOSV } from "@/lib/services/osv-service";
import { enrichAdvisory } from "@/lib/services/vulnerability-intel";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const ecosystem = searchParams.get("ecosystem") || "npm";
  const version = searchParams.get("version") || undefined;

  if (!name || name.trim() === "") {
    return NextResponse.json({ error: "Package or software name is required" }, { status: 400 });
  }

  try {
    const rawResult = await queryOSV(name, ecosystem, version);
    const enriched = (rawResult.vulns || []).map((advisory) =>
      enrichAdvisory(advisory, name, version)
    );

    // Compute summary metrics
    const confirmedCount = enriched.filter((f) => f.applicability === "CONFIRMED_AFFECTED").length;
    const potentialCount = enriched.filter((f) => f.applicability === "POTENTIALLY_AFFECTED").length;
    const notAffectedCount = enriched.filter((f) => f.applicability === "NOT_AFFECTED").length;
    const needsVerificationCount = enriched.filter((f) => f.applicability === "NEEDS_VERIFICATION").length;
    const urgentCount = enriched.filter((f) => f.priority === "FIX_URGENTLY").length;

    return NextResponse.json({
      query: {
        name,
        ecosystem,
        version: version || "unknown",
      },
      source: rawResult.source,
      queriedAt: rawResult.queriedAt,
      totalFindings: enriched.length,
      summary: {
        confirmedCount,
        potentialCount,
        notAffectedCount,
        needsVerificationCount,
        urgentCount,
      },
      findings: enriched,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Vulnerability data source temporarily unavailable",
        details: err.message,
        retryable: true,
      },
      { status: 502 }
    );
  }
}
