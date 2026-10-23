import { db } from "@/lib/db";
import {
  IncidentSeverity,
  IncidentStatus,
  ThreatCategory,
  AssignmentStatus,
} from "@prisma/client";

export class AssignmentService {
  /**
   * Find the most qualified and available technician for an incident
   */
  static async routeIncident(incidentId: string, orgId: string) {
    const incident = await db.incident.findUnique({
      where: { id: incidentId },
    });

    if (!incident) throw new Error("Incident not found");

    // Retrieve active technician profiles for this organization
    const technicians = await db.technicianProfile.findMany({
      where: {
        organizationId: orgId,
        isAvailable: true,
      },
      include: {
        user: true,
      },
    });

    if (technicians.length === 0) {
      console.warn(`No active technicians found for organization ${orgId}`);
      return null;
    }

    // Score candidates based on skill match, on-call state, and workload
    const scored = technicians.map((tech) => {
      let score = 0;

      // 1. Specialization match
      const hasSkill = tech.specializations.includes(incident.category);
      if (hasSkill) score += 50;

      // 2. On-call status
      if (tech.isOnCall) score += 30;

      // 3. Workload capacity (prefer technicians with lighter load)
      const capacityRemaining = tech.maxConcurrentIncidents - tech.currentLoad;
      if (capacityRemaining > 0) {
        score += Math.min(20, capacityRemaining * 4);
      } else {
        score -= 40; // Over capacity penalty
      }

      return { tech, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const chosen = scored[0].tech;

    // Create assignment record
    const assignment = await db.assignment.create({
      data: {
        incidentId: incident.id,
        technicianId: chosen.id,
        status: AssignmentStatus.PENDING,
        isPrimary: true,
        notes: `Assigned based on category specialization: ${incident.category}`,
      },
      include: {
        technician: {
          include: { user: true },
        },
      },
    });

    // Increment technician workload
    await db.technicianProfile.update({
      where: { id: chosen.id },
      data: { currentLoad: { increment: 1 } },
    });

    // Update incident status to ASSIGNED if needed
    if (incident.status === IncidentStatus.DETECTED || incident.status === IncidentStatus.TRIAGED) {
      await db.incident.update({
        where: { id: incident.id },
        data: { status: IncidentStatus.ASSIGNED },
      });
    }

    // Add timeline record
    await db.timelineEvent.create({
      data: {
        incidentId: incident.id,
        actorId: chosen.user.id,
        actorName: "Assignment Engine",
        action: "Technician Assigned",
        description: `Routed to ${chosen.user.name} (${chosen.specializations.join(", ")}). Acknowledgment deadline active.`,
        statusFrom: incident.status,
        statusTo: IncidentStatus.ASSIGNED,
        isVisibleToUser: true,
      },
    });

    // Send notification to technician
    await db.notification.create({
      data: {
        userId: chosen.user.id,
        organizationId: orgId,
        incidentId: incident.id,
        title: `New Incident Assigned: ${incident.title}`,
        body: `Severity: ${incident.severity}. Please acknowledge within the policy SLA.`,
        severity: incident.severity,
        channel: "IN_APP",
      },
    });

    return assignment;
  }

  /**
   * Technician acknowledges the assignment
   */
  static async acknowledgeAssignment(assignmentId: string, technicianUserId: string) {
    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        incident: true,
        technician: { include: { user: true } },
      },
    });

    if (!assignment) throw new Error("Assignment not found");

    const updated = await db.assignment.update({
      where: { id: assignmentId },
      data: {
        status: AssignmentStatus.ACKNOWLEDGED,
        acknowledgedAt: new Date(),
      },
    });

    // Update incident status to ACKNOWLEDGED
    await db.incident.update({
      where: { id: assignment.incidentId },
      data: {
        status: IncidentStatus.ACKNOWLEDGED,
        acknowledgedAt: new Date(),
      },
    });

    // Add timeline event
    await db.timelineEvent.create({
      data: {
        incidentId: assignment.incidentId,
        actorId: technicianUserId,
        actorName: assignment.technician.user.name,
        action: "Technician Acknowledged Incident",
        description: `${assignment.technician.user.name} has taken ownership and is initiating diagnostic review.`,
        statusFrom: IncidentStatus.ASSIGNED,
        statusTo: IncidentStatus.ACKNOWLEDGED,
        isVisibleToUser: true,
      },
    });

    return updated;
  }
}
