import { NextResponse } from "next/server";
import { IncidentService } from "@/lib/services/incident-service";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { response, userId, userName } = body;

    if (!["CONFIRMED_LEGITIMATE", "CONFIRMED_SUSPICIOUS", "REQUESTED_SUPPORT"].includes(response)) {
      return NextResponse.json({ error: "Invalid response code" }, { status: 400 });
    }

    // Default to Sarah Jenkins if not provided in demo
    let finalUserId = userId;
    let finalUserName = userName;

    if (!finalUserId) {
      const sarah = await db.user.findFirst({
        where: { email: "sarah@acme-corp.demo" },
      });
      if (sarah) {
        finalUserId = sarah.id;
        finalUserName = sarah.name;
      }
    }

    const updated = await IncidentService.recordUserResponse(
      id,
      finalUserId,
      finalUserName || "Sarah Jenkins",
      response
    );

    return NextResponse.json({ success: true, incident: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
