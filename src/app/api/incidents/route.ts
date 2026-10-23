import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { IncidentStatus, IncidentSeverity, ThreatCategory } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get("org") || "acme-corp";
    const status = searchParams.get("status") as IncidentStatus | null;
    const severity = searchParams.get("severity") as IncidentSeverity | null;
    const category = searchParams.get("category") as ThreatCategory | null;
    const userId = searchParams.get("userId");

    const org = await db.organization.findUnique({
      where: { slug: orgSlug },
    });

    if (!org) {
      return NextResponse.json({ incidents: [] });
    }

    const whereClause: Record<string, unknown> = {
      organizationId: org.id,
    };

    if (status) whereClause.status = status;
    if (severity) whereClause.severity = severity;
    if (category) whereClause.category = category;
    if (userId) whereClause.affectedUserId = userId;

    const incidents = await db.incident.findMany({
      where: whereClause,
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
        },
        securityEvents: {
          take: 3,
          orderBy: { receivedAt: "desc" },
        },
        timelineEvents: {
          take: 5,
          orderBy: { timestamp: "desc" },
        },
        resolution: true,
      },
      orderBy: { detectedAt: "desc" },
    });

    return NextResponse.json({ incidents });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
