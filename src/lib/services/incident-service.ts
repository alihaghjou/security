import { db } from "@/lib/db";
import {
  IncidentSeverity,
  IncidentStatus,
  SecondaryStatus,
  ThreatCategory,
  EventSource,
} from "@prisma/client";

export interface CreateIncidentInput {
  organizationId: string;
  title: string;
  description: string;
  plainLanguageSummary: string;
  severity: IncidentSeverity;
  category: ThreatCategory;
  affectedUserId?: string;
  isDemo?: boolean;
}

export class IncidentService {
  /**
   * Create an incident, record the initial timeline event, and auto-route.
   */
  static async createIncident(input: CreateIncidentInput) {
    const incident = await db.incident.create({
      data: {
        organizationId: input.organizationId,
        title: input.title,
        description: input.description,
        plainLanguageSummary: input.plainLanguageSummary,
        severity: input.severity,
        category: input.category,
        status: IncidentStatus.DETECTED,
        affectedUserId: input.affectedUserId,
        isDemo: input.isDemo ?? false,
      },
      include: {
        affectedUser: true,
        assignments: {
          include: {
            technician: {
              include: { user: true },
            },
          },
        },
      },
    });

    // Record initial detection timeline event
    await db.timelineEvent.create({
      data: {
        incidentId: incident.id,
        actorName: "SecureFlow Engine",
        action: "Security Event Detected",
        description: input.plainLanguageSummary,
        statusFrom: null,
        statusTo: IncidentStatus.DETECTED,
        isVisibleToUser: true,
      },
    });

    return incident;
  }

  /**
   * Transition incident through lifecycle states
   */
  static async updateStatus(
    incidentId: string,
    newStatus: IncidentStatus,
    actorName: string,
    notes?: string,
    actorId?: string,
    secondaryStatus?: SecondaryStatus | null
  ) {
    const current = await db.incident.findUnique({
      where: { id: incidentId },
    });

    if (!current) throw new Error("Incident not found");

    const updateData: Record<string, unknown> = {
      status: newStatus,
      updatedAt: new Date(),
    };

    if (secondaryStatus !== undefined) {
      updateData.secondaryStatus = secondaryStatus;
    }

    if (newStatus === IncidentStatus.TRIAGED && !current.triagedAt) {
      updateData.triagedAt = new Date();
    } else if (newStatus === IncidentStatus.ACKNOWLEDGED && !current.acknowledgedAt) {
      updateData.acknowledgedAt = new Date();
    } else if (newStatus === IncidentStatus.CONTAINED && !current.containedAt) {
      updateData.containedAt = new Date();
    } else if (newStatus === IncidentStatus.RESOLVED && !current.resolvedAt) {
      updateData.resolvedAt = new Date();
    } else if (newStatus === IncidentStatus.CLOSED && !current.closedAt) {
      updateData.closedAt = new Date();
    }

    const updated = await db.incident.update({
      where: { id: incidentId },
      data: updateData,
      include: {
        assignments: {
          include: {
            technician: { include: { user: true } },
          },
        },
      },
    });

    // Timeline event
    await db.timelineEvent.create({
      data: {
        incidentId,
        actorId,
        actorName,
        action: `Status updated to ${newStatus}`,
        description: notes || `Incident transitioned from ${current.status} to ${newStatus}.`,
        statusFrom: current.status,
        statusTo: newStatus,
        isVisibleToUser: true,
      },
    });

    return updated;
  }

  /**
   * Process user confirmation response: "Yes, it was me" or "No, protect my account"
   */
  static async recordUserResponse(
    incidentId: string,
    userId: string,
    userName: string,
    response: "CONFIRMED_LEGITIMATE" | "CONFIRMED_SUSPICIOUS" | "REQUESTED_SUPPORT"
  ) {
    const incident = await db.incident.findUnique({
      where: { id: incidentId },
    });

    if (!incident) throw new Error("Incident not found");

    if (response === "CONFIRMED_LEGITIMATE") {
      // User says "Yes, that was me"
      await db.timelineEvent.create({
        data: {
          incidentId,
          actorId: userId,
          actorName: userName,
          action: "User Verified Activity",
          description: "User verified that the login or action was legitimate. Closing alert as false alarm.",
          statusFrom: incident.status,
          statusTo: IncidentStatus.RESOLVED,
          isVisibleToUser: true,
        },
      });

      return await db.incident.update({
        where: { id: incidentId },
        data: {
          status: IncidentStatus.RESOLVED,
          secondaryStatus: SecondaryStatus.FALSE_POSITIVE,
          resolvedAt: new Date(),
        },
      });
    } else if (response === "CONFIRMED_SUSPICIOUS") {
      // User says "No, protect my account!"
      await db.timelineEvent.create({
        data: {
          incidentId,
          actorId: userId,
          actorName: userName,
          action: "User Flagged Compromise",
          description: "User reported they did not initiate this sign-in attempt. Escalating to urgent technician triage.",
          statusFrom: incident.status,
          statusTo: IncidentStatus.INVESTIGATING,
          isVisibleToUser: true,
        },
      });

      return await db.incident.update({
        where: { id: incidentId },
        data: {
          severity: IncidentSeverity.CRITICAL,
          status: IncidentStatus.INVESTIGATING,
          secondaryStatus: SecondaryStatus.ESCALATED,
        },
      });
    } else {
      // User requested support
      await db.timelineEvent.create({
        data: {
          incidentId,
          actorId: userId,
          actorName: userName,
          action: "User Requested Security Support",
          description: "User requested immediate clarification from the assigned security technician.",
          isVisibleToUser: true,
        },
      });

      return incident;
    }
  }

  /**
   * Resolve incident with verifiable root cause, remediation steps, and closure summary
   */
  static async resolveIncident(
    incidentId: string,
    technicianUserId: string,
    technicianName: string,
    details: {
      summary: string;
      rootCause?: string;
      actionsTaken?: string;
      preventionSteps?: string;
    }
  ) {
    // Upsert resolution
    await db.incidentResolution.upsert({
      where: { incidentId },
      create: {
        incidentId,
        resolvedById: technicianUserId,
        summary: details.summary,
        rootCause: details.rootCause,
        actionsTaken: details.actionsTaken,
        preventionSteps: details.preventionSteps,
        verifiedAt: new Date(),
        verifiedById: technicianUserId,
      },
      update: {
        summary: details.summary,
        rootCause: details.rootCause,
        actionsTaken: details.actionsTaken,
        preventionSteps: details.preventionSteps,
        verifiedAt: new Date(),
        verifiedById: technicianUserId,
      },
    });

    // Update incident status
    const updated = await db.incident.update({
      where: { id: incidentId },
      data: {
        status: IncidentStatus.RESOLVED,
        resolvedAt: new Date(),
      },
    });

    // Add timeline record
    await db.timelineEvent.create({
      data: {
        incidentId,
        actorId: technicianUserId,
        actorName: technicianName,
        action: "Remediation Verified & Resolved",
        description: details.summary,
        statusFrom: IncidentStatus.INVESTIGATING,
        statusTo: IncidentStatus.RESOLVED,
        isVisibleToUser: true,
      },
    });

    // Send notification to user that issue is resolved
    if (updated.affectedUserId) {
      await db.notification.create({
        data: {
          userId: updated.affectedUserId,
          organizationId: updated.organizationId,
          incidentId: updated.id,
          title: "Security Issue Resolved",
          body: `Good news! Your security incident "${updated.title}" has been investigated and safely resolved by ${technicianName}.`,
          severity: IncidentSeverity.LOW,
          channel: "IN_APP",
        },
      });
    }

    return updated;
  }
}
