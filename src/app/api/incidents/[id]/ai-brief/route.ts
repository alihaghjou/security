import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AISecurityAssistant } from "@/lib/services/ai-service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "user"; // "user" or "technician"

    const incident = await db.incident.findUnique({
      where: { id },
      include: {
        securityEvents: true,
      },
    });

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    if (view === "technician") {
      const evidence = incident.securityEvents.map(
        (e) => `${e.normalizedTitle} (${e.sourceIp || e.targetAsset || "System"})`
      );
      const brief = await AISecurityAssistant.generateTechnicianBrief(
        incident.title,
        incident.category,
        incident.severity,
        evidence
      );
      return NextResponse.json({ brief });
    } else {
      const explanation = await AISecurityAssistant.explainForUser(
        incident.title,
        incident.category,
        incident.severity
      );
      return NextResponse.json({ explanation });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
