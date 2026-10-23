import { NextRequest, NextResponse } from "next/server";
import { generateFixGuidance } from "@/lib/services/ai-assistant";
import { getOSVVulnerability } from "@/lib/services/osv-service";
import { enrichAdvisory } from "@/lib/services/vulnerability-intel";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { advisoryId, packageName, currentVersion, ecosystem, mode } = body;

    if (!advisoryId || !packageName) {
      return NextResponse.json(
        { error: "advisoryId and packageName are required" },
        { status: 400 }
      );
    }

    // Retrieve authoritative advisory
    const raw = await getOSVVulnerability(advisoryId);
    if (!raw) {
      return NextResponse.json(
        { error: `Advisory ${advisoryId} could not be found` },
        { status: 404 }
      );
    }

    const enriched = enrichAdvisory(raw, packageName, currentVersion || "unknown");
    const guidance = generateFixGuidance(
      enriched,
      packageName,
      currentVersion || "unknown",
      ecosystem || "npm",
      mode === "DEVELOPER" ? "DEVELOPER" : "PERSONAL"
    );

    return NextResponse.json({ guidance, finding: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
