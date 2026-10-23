import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { IncidentService } from "@/lib/services/incident-service";
import { IncidentStatus } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const incident = await db.incident.findUnique({
      where: { id },
      include: {
        affectedUser: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        assignments: {
          include: {
            technician: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
          orderBy: { assignedAt: "desc" },
        },
        securityEvents: {
          orderBy: { receivedAt: "desc" },
        },
        timelineEvents: {
          orderBy: { timestamp: "desc" },
        },
        investigationNotes: {
          include: {
            author: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        messages: {
          include: {
            sender: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        resolution: {
          include: {
            resolvedBy: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    return NextResponse.json({ incident });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { status, actorName, notes, actorId, resolution } = body;

    if (resolution) {
      const resolved = await IncidentService.resolveIncident(
        id,
        actorId || "demo-technician",
        actorName || "Alex Chen",
        resolution
      );
      return NextResponse.json({ success: true, incident: resolved });
    }

    if (status) {
      const updated = await IncidentService.updateStatus(
        id,
        status as IncidentStatus,
        actorName || "Alex Chen",
        notes,
        actorId
      );
      return NextResponse.json({ success: true, incident: updated });
    }

    return NextResponse.json({ error: "No update parameters provided" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
