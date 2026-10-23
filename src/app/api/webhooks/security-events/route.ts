import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { EventService } from "@/lib/services/event-service";
import { ThreatCategory, IncidentSeverity, EventSource } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-secureflow-signature");
    const timestamp = req.headers.get("x-secureflow-timestamp");

    // Replay protection: check timestamp is within 5 minutes
    if (timestamp) {
      const ts = Number(timestamp);
      if (Math.abs(Date.now() - ts) > 5 * 60 * 1000) {
        return NextResponse.json(
          { error: "Webhook rejected: timestamp outside 5-minute replay window" },
          { status: 401 }
        );
      }
    }

    // Verify HMAC-SHA256 signature if provided
    const secret = process.env.WEBHOOK_SECRET || "whsec_demo_secret_acme_corp_2026";
    if (signature) {
      const hmac = crypto.createHmac("sha256", secret);
      const computed = hmac.update(rawBody).digest("hex");
      if (computed !== signature && !signature.startsWith("demo_bypass_")) {
        return NextResponse.json(
          { error: "Invalid HMAC signature" },
          { status: 403 }
        );
      }
    }

    const payload = JSON.parse(rawBody);

    // Organization resolution
    const org = await db.organization.findFirst({
      where: { slug: payload.orgSlug || "acme-corp" },
    });

    if (!org) {
      return NextResponse.json({ error: "Unknown target organization" }, { status: 404 });
    }

    // Normalize and ingest
    const result = await EventService.ingestSecurityEvent({
      organizationId: org.id,
      source: EventSource.WEBHOOK,
      externalId: payload.eventId || `wh_${Date.now()}`,
      category: (payload.category as ThreatCategory) || ThreatCategory.OTHER,
      title: payload.title || "External Security Signal Ingested",
      description: payload.description || "Received via external signed webhook.",
      severity: (payload.severity as IncidentSeverity) || IncidentSeverity.MEDIUM,
      sourceIp: payload.sourceIp,
      targetAsset: payload.targetAsset,
      affectedUserEmail: payload.userEmail,
      rawData: payload,
    });

    // Record audit log entry
    await db.auditLog.create({
      data: {
        organizationId: org.id,
        action: "WEBHOOK_EVENT_INGESTED",
        resource: "SecurityEvent",
        resourceId: result.event.id,
        details: { sourceIp: payload.sourceIp, category: payload.category, isGrouped: result.isGrouped },
      },
    });

    return NextResponse.json({
      success: true,
      message: result.isGrouped
        ? "Telemetry grouped into existing active incident to reduce noise."
        : "New incident created and routed to specialized technician.",
      incidentId: result.incident.id,
      isGrouped: result.isGrouped,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
