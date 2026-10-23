import { db } from "@/lib/db";
import {
  IncidentSeverity,
  IncidentStatus,
  ThreatCategory,
  EventSource,
} from "@prisma/client";
import { IncidentService } from "./incident-service";
import { AssignmentService } from "./assignment-service";

export interface NormalizedSecurityPayload {
  organizationId: string;
  source: EventSource;
  externalId?: string;
  category: ThreatCategory;
  title: string;
  description: string;
  severity: IncidentSeverity;
  sourceIp?: string;
  targetAsset?: string;
  affectedUserEmail?: string;
  rawData?: Record<string, unknown>;
}

export class EventService {
  /**
   * Ingest an incoming security event with automatic duplicate check and grouping
   */
  static async ingestSecurityEvent(payload: NormalizedSecurityPayload) {
    // 1. Resolve affected user if email is provided
    let affectedUserId: string | undefined;
    if (payload.affectedUserEmail) {
      const user = await db.user.findUnique({
        where: { email: payload.affectedUserEmail },
      });
      if (user) affectedUserId = user.id;
    }

    // 2. Correlation & Duplicate Check within a 15-minute sliding window
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const existingRelatedIncident = await db.incident.findFirst({
      where: {
        organizationId: payload.organizationId,
        category: payload.category,
        status: { in: [IncidentStatus.DETECTED, IncidentStatus.TRIAGED, IncidentStatus.ASSIGNED, IncidentStatus.INVESTIGATING] },
        detectedAt: { gte: fifteenMinutesAgo },
        ...(affectedUserId ? { affectedUserId } : {}),
      },
      include: { securityEvents: true },
    });

    if (existingRelatedIncident) {
      // Correlate into existing incident — don't flood user with another incident
      const event = await db.securityEvent.create({
        data: {
          organizationId: payload.organizationId,
          source: payload.source,
          externalId: payload.externalId,
          category: payload.category,
          normalizedTitle: payload.title,
          normalizedDescription: payload.description,
          severity: payload.severity,
          sourceIp: payload.sourceIp,
          targetAsset: payload.targetAsset,
          affectedUserId,
          rawData: (payload.rawData ?? {}) as object,
          incidentId: existingRelatedIncident.id,
        },
      });

      // Add a timeline entry for the correlated telemetry
      await db.timelineEvent.create({
        data: {
          incidentId: existingRelatedIncident.id,
          actorName: "Telemetry Correlation Engine",
          action: "Correlated Telemetry Event Grouped",
          description: `Additional matching event detected from ${payload.sourceIp || payload.targetAsset || "monitored system"}. Automatically grouped into active case to prevent alert noise.`,
          isVisibleToUser: false, // Internal technical grouping
        },
      });

      return {
        event,
        incident: existingRelatedIncident,
        isGrouped: true,
      };
    }

    // 3. New unique incident needed
    const plainLanguageSummary = this.generateUserSummary(payload);

    const incident = await IncidentService.createIncident({
      organizationId: payload.organizationId,
      title: payload.title,
      description: payload.description,
      plainLanguageSummary,
      severity: payload.severity,
      category: payload.category,
      affectedUserId,
    });

    // Store the raw security event and link to the new incident
    const event = await db.securityEvent.create({
      data: {
        organizationId: payload.organizationId,
        source: payload.source,
        externalId: payload.externalId,
        category: payload.category,
        normalizedTitle: payload.title,
        normalizedDescription: payload.description,
        severity: payload.severity,
        sourceIp: payload.sourceIp,
        targetAsset: payload.targetAsset,
        affectedUserId,
        rawData: (payload.rawData ?? {}) as object,
        incidentId: incident.id,
      },
    });

    // Automatically route to appropriate technician
    await AssignmentService.routeIncident(incident.id, payload.organizationId);

    // Notify affected user with calm, plain-language notification
    if (affectedUserId) {
      await db.notification.create({
        data: {
          userId: affectedUserId,
          organizationId: payload.organizationId,
          incidentId: incident.id,
          title: "Security Notice: Sign-in confirmation needed",
          body: plainLanguageSummary,
          severity: payload.severity,
          channel: "IN_APP",
        },
      });
    }

    return {
      event,
      incident,
      isGrouped: false,
    };
  }

  /**
   * Helper to craft calm, clear, non-jargon explanations for regular users
   */
  private static generateUserSummary(payload: NormalizedSecurityPayload): string {
    switch (payload.category) {
      case ThreatCategory.IDENTITY:
        return `We noticed a sign-in attempt from an unfamiliar device or location (${payload.sourceIp || "remote network"}). Please confirm whether this was you.`;
      case ThreatCategory.ENDPOINT:
        return `A suspicious application or process was isolated on monitored device (${payload.targetAsset || "workstation"}). Our security team is verifying safe removal.`;
      case ThreatCategory.EMAIL:
        return `A potentially misleading email pretending to be an urgent internal request was quarantined for your safety.`;
      default:
        return `Our security monitoring flagged an unexpected activity on your account. A dedicated technician is currently reviewing the event.`;
    }
  }
}
