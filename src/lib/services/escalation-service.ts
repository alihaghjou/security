import { db } from "@/lib/db";
import {
  IncidentSeverity,
  IncidentStatus,
  SecondaryStatus,
  AssignmentStatus,
} from "@prisma/client";

export class EscalationService {
  /**
   * Run escalation check: identify unacknowledged assignments past deadline and escalate to backup
   */
  static async processEscalations(orgId: string) {
    const policies = await db.escalationPolicy.findMany({
      where: { organizationId: orgId, isActive: true },
      include: { escalationTarget: { include: { user: true } } },
    });

    const results = [];

    for (const policy of policies) {
      // Find pending assignments matching policy severity
      const pendingAssignments = await db.assignment.findMany({
        where: {
          status: AssignmentStatus.PENDING,
          incident: {
            organizationId: orgId,
            severity: policy.severity,
            status: IncidentStatus.ASSIGNED,
          },
        },
        include: {
          incident: true,
          technician: { include: { user: true } },
          escalationAttempts: true,
        },
      });

      for (const assignment of pendingAssignments) {
        // Prevent infinite loops: check if already escalated recently
        if (assignment.escalationAttempts.length >= 2) {
          continue;
        }

        const minutesElapsed =
          (Date.now() - new Date(assignment.assignedAt).getTime()) / (1000 * 60);

        if (minutesElapsed >= policy.acknowledgmentDeadlineMinutes) {
          // Trigger Escalation
          const escalated = await this.escalateAssignment(assignment, policy);
          results.push(escalated);
        }
      }
    }

    return results;
  }

  /**
   * Execute escalation for an assignment
   */
  static async escalateAssignment(
    assignment: {
      id: string;
      incidentId: string;
      technician: { user: { name: string; id: string } };
      incident: { id: string; title: string; organizationId: string; severity: IncidentSeverity };
    },
    policy: {
      id: string;
      acknowledgmentDeadlineMinutes: number;
      escalationTarget?: { id: string; user: { id: string; name: string } } | null;
      notifyAdmins: boolean;
    }
  ) {
    // 1. Mark existing assignment as ESCALATED
    await db.assignment.update({
      where: { id: assignment.id },
      data: { status: AssignmentStatus.ESCALATED },
    });

    // 2. Set secondary status on incident
    await db.incident.update({
      where: { id: assignment.incidentId },
      data: { secondaryStatus: SecondaryStatus.ESCALATED },
    });

    // 3. Find backup target technician
    let backupTech = policy.escalationTarget;
    if (!backupTech) {
      const availableTech = await db.technicianProfile.findFirst({
        where: {
          organizationId: assignment.incident.organizationId,
          isAvailable: true,
          user: { id: { not: assignment.technician.user.id } },
        },
        include: { user: true },
      });
      if (availableTech) backupTech = availableTech;
    }

    // 4. Record escalation attempt to prevent looping
    await db.escalationAttempt.create({
      data: {
        incidentId: assignment.incidentId,
        assignmentId: assignment.id,
        policyId: policy.id,
        targetTechnicianId: backupTech?.id || assignment.technician.user.id,
        wasAcknowledged: false,
      },
    });

    // 5. Timeline entry
    const backupName = backupTech ? backupTech.user.name : "Senior SOC Lead / Admin Queue";
    await db.timelineEvent.create({
      data: {
        incidentId: assignment.incidentId,
        actorName: "SLA Escalation Engine",
        action: "Missed Acknowledgment Escalation",
        description: `Primary technician (${assignment.technician.user.name}) did not acknowledge within the ${policy.acknowledgmentDeadlineMinutes}-minute SLA. Re-routed to backup: ${backupName}.`,
        statusFrom: IncidentStatus.ASSIGNED,
        statusTo: IncidentStatus.ASSIGNED,
        isVisibleToUser: false, // Internal technical event
      },
    });

    // 6. If backup technician exists, create new assignment
    if (backupTech) {
      await db.assignment.create({
        data: {
          incidentId: assignment.incidentId,
          technicianId: backupTech.id,
          status: AssignmentStatus.PENDING,
          isPrimary: true,
          notes: `Escalated from ${assignment.technician.user.name} due to missed response window.`,
        },
      });

      // Notify backup
      await db.notification.create({
        data: {
          userId: backupTech.user.id,
          organizationId: assignment.incident.organizationId,
          incidentId: assignment.incidentId,
          title: `[ESCALATED] Immediate Attention Required: ${assignment.incident.title}`,
          body: `Escalated to you after primary technician missed SLA window.`,
          severity: IncidentSeverity.CRITICAL,
          channel: "IN_APP",
        },
      });
    }

    return {
      incidentId: assignment.incidentId,
      previousTechnician: assignment.technician.user.name,
      escalatedTo: backupName,
    };
  }
}
