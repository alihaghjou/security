import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  IncidentSeverity,
  IncidentStatus,
  SecondaryStatus,
  ThreatCategory,
  AssignmentStatus,
  EventSource,
} from "@prisma/client";
import { EventService } from "@/lib/services/event-service";
import { EscalationService } from "@/lib/services/escalation-service";
import { IncidentService } from "@/lib/services/incident-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const scenario = Number(body.scenario);

    // Get Acme Corp org
    const acmeOrg = await db.organization.findFirst({
      where: { slug: "acme-corp" },
      include: {
        members: { include: { user: true } },
        technicianProfiles: { include: { user: true } },
      },
    });

    if (!acmeOrg) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const sarahUser = acmeOrg.members.find((m) => m.user.email === "sarah@acme-corp.demo")?.user;
    const alexTech = acmeOrg.technicianProfiles.find((t) => t.user.email === "alex@secureflow.demo");
    const elenaTech = acmeOrg.technicianProfiles.find((t) => t.user.email === "elena@secureflow.demo");

    if (!sarahUser || !alexTech || !elenaTech) {
      return NextResponse.json({ error: "Seed users missing" }, { status: 500 });
    }

    if (scenario === 1) {
      // SCENARIO 1: Suspicious login arrives, asks user "Was this you?"
      const result = await EventService.ingestSecurityEvent({
        organizationId: acmeOrg.id,
        source: EventSource.SIMULATOR,
        category: ThreatCategory.IDENTITY,
        title: "New Sign-in Attempt from Tokyo, Japan",
        description: `Unusual sign-in attempt detected for ${sarahUser.email} from IP 133.242.18.91 (Tokyo, JP).`,
        severity: IncidentSeverity.HIGH,
        sourceIp: "133.242.18.91",
        targetAsset: "Acme Single Sign-On",
        affectedUserEmail: sarahUser.email,
        rawData: { location: "Tokyo, Japan", browser: "Chrome 124 / Linux", isNewDevice: true },
      });

      return NextResponse.json({
        success: true,
        scenario: 1,
        message: "Scenario 1 Launched: Suspicious login flagged. User confirmation requested.",
        incidentId: result.incident.id,
      });
    } else if (scenario === 2) {
      // SCENARIO 2: Endpoint malware detection
      const result = await EventService.ingestSecurityEvent({
        organizationId: acmeOrg.id,
        source: EventSource.SIMULATOR,
        category: ThreatCategory.ENDPOINT,
        title: "Malware Cryptominer Quarantined on Workstation",
        description: "EDR telemetry quarantined xmrig_agent.bin on host WKSTN-DEV-12.",
        severity: IncidentSeverity.CRITICAL,
        targetAsset: "WKSTN-DEV-12 (Ubuntu 24.04)",
        affectedUserEmail: sarahUser.email,
        rawData: { hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
      });

      return NextResponse.json({
        success: true,
        scenario: 2,
        message: "Scenario 2 Launched: Endpoint malware intercepted and assigned to specialist.",
        incidentId: result.incident.id,
      });
    } else if (scenario === 3) {
      // SCENARIO 3: Technician missed acknowledgment SLA -> Auto-escalate to backup
      // Create a critical incident assigned to Alex with an artificial past assignedAt
      const inc = await db.incident.create({
        data: {
          organizationId: acmeOrg.id,
          title: "[SLA Test] Critical Ransomware Activity Flagged",
          description: "Volume shadow copy deletion command intercepted on central file repository.",
          plainLanguageSummary: "A high-priority alert was escalated after the initial response window elapsed.",
          severity: IncidentSeverity.CRITICAL,
          category: ThreatCategory.ENDPOINT,
          status: IncidentStatus.ASSIGNED,
          isDemo: true,
        },
      });

      const pastTime = new Date(Date.now() - 30 * 60 * 1000); // 30 mins ago (deadline is 15 mins)
      const assignment = await db.assignment.create({
        data: {
          incidentId: inc.id,
          technicianId: alexTech.id,
          status: AssignmentStatus.PENDING,
          assignedAt: pastTime,
        },
      });

      // Run escalation processor
      const escalated = await EscalationService.processEscalations(acmeOrg.id);

      return NextResponse.json({
        success: true,
        scenario: 3,
        message: "Scenario 3 Launched: Primary technician missed 15-min SLA. Auto-escalated to backup Elena Rostova.",
        incidentId: inc.id,
        escalationDetails: escalated,
      });
    } else if (scenario === 4) {
      // SCENARIO 4: Duplicate alert grouping
      // Fire 2 rapid events with identical category and source
      const first = await EventService.ingestSecurityEvent({
        organizationId: acmeOrg.id,
        source: EventSource.SIMULATOR,
        category: ThreatCategory.NETWORK,
        title: "Perimeter Port Sweep Detected",
        description: "Multiple TCP SYN packets to port 445 from source IP 203.0.113.88",
        severity: IncidentSeverity.MEDIUM,
        sourceIp: "203.0.113.88",
        targetAsset: "Perimeter Firewall Node A",
      });

      // Second matching event 1 second later
      const second = await EventService.ingestSecurityEvent({
        organizationId: acmeOrg.id,
        source: EventSource.SIMULATOR,
        category: ThreatCategory.NETWORK,
        title: "Perimeter Port Sweep Detected (Repetition)",
        description: "Additional TCP SYN bursts to port 3389 from source IP 203.0.113.88",
        severity: IncidentSeverity.MEDIUM,
        sourceIp: "203.0.113.88",
        targetAsset: "Perimeter Firewall Node A",
      });

      return NextResponse.json({
        success: true,
        scenario: 4,
        message: "Scenario 4 Launched: Two bursts of network telemetry arrived; second event was correlated into the single existing case.",
        incidentId: first.incident.id,
        isSecondGrouped: second.isGrouped,
      });
    } else if (scenario === 5) {
      // SCENARIO 5: Verified Incident Resolution
      // Find an open or investigating incident and mark it verified & resolved
      const openIncident = await db.incident.findFirst({
        where: {
          organizationId: acmeOrg.id,
          status: { in: [IncidentStatus.ASSIGNED, IncidentStatus.INVESTIGATING] },
        },
      });

      if (!openIncident) {
        return NextResponse.json({ message: "No active incident found to resolve. Please launch Scenario 1 or 2 first." });
      }

      await IncidentService.resolveIncident(
        openIncident.id,
        alexTech.user.id,
        alexTech.user.name,
        {
          summary: "Threat fully mitigated. Malicious IP blocked at edge and forensic scan confirms zero persistence.",
          rootCause: "Attacker attempted credential stuffing using compromised breach corpus from third-party site.",
          actionsTaken: "Revoked active tokens, updated geo-blocking rule, and verified endpoint integrity.",
          preventionSteps: "Recommend migrating remaining accounts to hardware FIDO2 authentication.",
        }
      );

      return NextResponse.json({
        success: true,
        scenario: 5,
        message: `Scenario 5 Launched: Incident "${openIncident.title}" marked verified and resolved with full audit record.`,
        incidentId: openIncident.id,
      });
    }

    return NextResponse.json({ error: "Invalid scenario index (1-5)" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
