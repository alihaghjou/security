import { PrismaClient, UserRole, IncidentSeverity, IncidentStatus, SecondaryStatus, ThreatCategory, AssignmentStatus, NotificationType, EventSource } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting SecureFlow database seed...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.incidentMessage.deleteMany();
  await prisma.investigationNote.deleteMany();
  await prisma.incidentResolution.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.escalationAttempt.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.securityEvent.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.escalationPolicy.deleteMany();
  await prisma.securityRecommendation.deleteMany();
  await prisma.integration.deleteMany();
  await prisma.onCallSchedule.deleteMany();
  await prisma.technicianProfile.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const passwordHash = await bcrypt.hash("demo-password", 10);

  // 1. Create Organizations
  const acmeOrg = await prisma.organization.create({
    data: {
      name: "Acme Corporation",
      slug: "acme-corp",
      domain: "acme-corp.demo",
      plan: "enterprise",
      settings: {
        mfaRequired: true,
        sessionTimeoutHours: 8,
        retentionDays: 365,
        autoEscalationEnabled: true,
      },
    },
  });

  const globexOrg = await prisma.organization.create({
    data: {
      name: "Globex Industries",
      slug: "globex",
      domain: "globex.demo",
      plan: "business",
      settings: {
        mfaRequired: true,
        autoEscalationEnabled: true,
      },
    },
  });

  console.log("✓ Created organizations: Acme Corporation, Globex Industries");

  // 2. Create Users
  const sarahUser = await prisma.user.create({
    data: {
      email: "sarah@acme-corp.demo",
      name: "Sarah Jenkins",
      passwordHash,
      emailVerified: true,
    },
  });

  const marcusUser = await prisma.user.create({
    data: {
      email: "marcus@acme-corp.demo",
      name: "Marcus Wright",
      passwordHash,
      emailVerified: true,
    },
  });

  const alexTech = await prisma.user.create({
    data: {
      email: "alex@secureflow.demo",
      name: "Alex Chen",
      passwordHash,
      emailVerified: true,
    },
  });

  const elenaTech = await prisma.user.create({
    data: {
      email: "elena@secureflow.demo",
      name: "Elena Rostova",
      passwordHash,
      emailVerified: true,
    },
  });

  const jordanAdmin = await prisma.user.create({
    data: {
      email: "jordan@acme-corp.demo",
      name: "Jordan Lee",
      passwordHash,
      emailVerified: true,
    },
  });

  const taylorMssp = await prisma.user.create({
    data: {
      email: "taylor@secureflow.demo",
      name: "Taylor Vance",
      passwordHash,
      emailVerified: true,
    },
  });

  console.log("✓ Created demo users");

  // 3. Organization Memberships
  await prisma.organizationMember.createMany({
    data: [
      { userId: sarahUser.id, organizationId: acmeOrg.id, role: UserRole.USER },
      { userId: marcusUser.id, organizationId: acmeOrg.id, role: UserRole.USER },
      { userId: alexTech.id, organizationId: acmeOrg.id, role: UserRole.TECHNICIAN },
      { userId: elenaTech.id, organizationId: acmeOrg.id, role: UserRole.TECHNICIAN },
      { userId: jordanAdmin.id, organizationId: acmeOrg.id, role: UserRole.ADMIN },
      { userId: taylorMssp.id, organizationId: acmeOrg.id, role: UserRole.MSSP_ADMIN },
      { userId: taylorMssp.id, organizationId: globexOrg.id, role: UserRole.MSSP_ADMIN },
    ],
  });

  // 4. Technician Profiles
  const alexProfile = await prisma.technicianProfile.create({
    data: {
      userId: alexTech.id,
      organizationId: acmeOrg.id,
      specializations: [ThreatCategory.IDENTITY, ThreatCategory.ENDPOINT],
      isAvailable: true,
      isOnCall: true,
      maxConcurrentIncidents: 6,
      currentLoad: 2,
    },
  });

  const elenaProfile = await prisma.technicianProfile.create({
    data: {
      userId: elenaTech.id,
      organizationId: acmeOrg.id,
      specializations: [ThreatCategory.EMAIL, ThreatCategory.NETWORK, ThreatCategory.CLOUD],
      isAvailable: true,
      isOnCall: false,
      maxConcurrentIncidents: 5,
      currentLoad: 1,
    },
  });

  console.log("✓ Created technician profiles");

  // 5. Escalation Policies
  const criticalPolicy = await prisma.escalationPolicy.create({
    data: {
      organizationId: acmeOrg.id,
      name: "Critical 15-Minute Acknowledgment SLA",
      severity: IncidentSeverity.CRITICAL,
      acknowledgmentDeadlineMinutes: 15,
      escalationTargetId: elenaProfile.id,
      notifyAdmins: true,
      isActive: true,
    },
  });

  await prisma.escalationPolicy.create({
    data: {
      organizationId: acmeOrg.id,
      name: "High Severity 30-Minute SLA",
      severity: IncidentSeverity.HIGH,
      acknowledgmentDeadlineMinutes: 30,
      escalationTargetId: elenaProfile.id,
      notifyAdmins: true,
      isActive: true,
    },
  });

  // 6. Security Integrations
  await prisma.integration.create({
    data: {
      organizationId: acmeOrg.id,
      name: "Cloud Identity Guard Webhook",
      type: "WEBHOOK",
      config: { endpoint: "/api/webhooks/security-events", signatureVerification: true },
      webhookSecret: "whsec_demo_secret_acme_corp_2026",
      isActive: true,
      lastEventAt: new Date(),
    },
  });

  // 7. Seed Incidents

  // SCENARIO 1: Suspicious Login (Requires user confirmation)
  const incident1 = await prisma.incident.create({
    data: {
      organizationId: acmeOrg.id,
      title: "Unfamiliar Sign-in Attempt from Overseas Network",
      description: "Authentication request detected for sarah@acme-corp.demo from IP 185.220.101.5 (Amsterdam, NL) using Safari on macOS. Geo-velocity differs from last sign-in 45 minutes ago in Chicago.",
      plainLanguageSummary: "We noticed a sign-in attempt from an unfamiliar location. Please confirm whether this was you.",
      severity: IncidentSeverity.HIGH,
      category: ThreatCategory.IDENTITY,
      status: IncidentStatus.ASSIGNED,
      secondaryStatus: SecondaryStatus.AWAITING_USER,
      affectedUserId: sarahUser.id,
      isDemo: true,
    },
  });

  await prisma.securityEvent.create({
    data: {
      organizationId: acmeOrg.id,
      incidentId: incident1.id,
      source: EventSource.SIMULATOR,
      category: ThreatCategory.IDENTITY,
      normalizedTitle: "Anomalous Geo-velocity Authentication",
      normalizedDescription: "User authenticated from IP 185.220.101.5 while previous session was active in Chicago.",
      severity: IncidentSeverity.HIGH,
      sourceIp: "185.220.101.5",
      targetAsset: "Okta / Azure AD Cloud Identity",
      affectedUserId: sarahUser.id,
      rawData: {
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
        country: "Netherlands",
        asn: "AS60729",
      },
    },
  });

  await prisma.assignment.create({
    data: {
      incidentId: incident1.id,
      technicianId: alexProfile.id,
      status: AssignmentStatus.PENDING,
      isPrimary: true,
      notes: "Routed to Identity Security Specialist. Awaiting user sign-in confirmation.",
    },
  });

  await prisma.timelineEvent.createMany({
    data: [
      {
        incidentId: incident1.id,
        actorName: "Identity Telemetry Monitor",
        action: "Signal Detected",
        description: "Anomalous geographic sign-in flagged by continuous identity protection.",
        statusTo: IncidentStatus.DETECTED,
        isVisibleToUser: true,
      },
      {
        incidentId: incident1.id,
        actorName: "SecureFlow Routing Engine",
        action: "Routed to Identity Specialist",
        description: "Assigned to Alex Chen (Specialization: Identity & Endpoint).",
        statusFrom: IncidentStatus.DETECTED,
        statusTo: IncidentStatus.ASSIGNED,
        isVisibleToUser: true,
      },
    ],
  });

  // SCENARIO 2: Endpoint Malware (Investigating with quarantine)
  const incident2 = await prisma.incident.create({
    data: {
      organizationId: acmeOrg.id,
      title: "Trojan Dropper Intercepted on Finance Workstation",
      description: "Host agent intercepted process invoice_details.exe executing from temp directory with known malicious hash SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069.",
      plainLanguageSummary: "Potentially harmful software was detected and isolated on a monitored device.",
      severity: IncidentSeverity.CRITICAL,
      category: ThreatCategory.ENDPOINT,
      status: IncidentStatus.INVESTIGATING,
      affectedUserId: sarahUser.id,
      triagedAt: new Date(Date.now() - 40 * 60 * 1000),
      acknowledgedAt: new Date(Date.now() - 35 * 60 * 1000),
      isDemo: true,
    },
  });

  await prisma.securityEvent.create({
    data: {
      organizationId: acmeOrg.id,
      incidentId: incident2.id,
      source: EventSource.SIMULATOR,
      category: ThreatCategory.ENDPOINT,
      normalizedTitle: "Process Execution Quarantined",
      normalizedDescription: "EDR agent killed and quarantined binary invoice_details.exe.",
      severity: IncidentSeverity.CRITICAL,
      targetAsset: "WKSTN-FIN-04 (macOS Sonoma / Parallels)",
      affectedUserId: sarahUser.id,
      rawData: {
        hash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        processName: "invoice_details.exe",
        parentProcess: "outlook.exe",
      },
    },
  });

  await prisma.assignment.create({
    data: {
      incidentId: incident2.id,
      technicianId: alexProfile.id,
      status: AssignmentStatus.IN_PROGRESS,
      isPrimary: true,
      acknowledgedAt: new Date(Date.now() - 35 * 60 * 1000),
      notes: "Host quarantined. Running memory forensics and inspecting registry run keys.",
    },
  });

  await prisma.timelineEvent.createMany({
    data: [
      {
        incidentId: incident2.id,
        actorName: "Endpoint Defense Agent",
        action: "Threat Quarantined",
        description: "Process invoice_details.exe blocked before memory execution.",
        statusTo: IncidentStatus.DETECTED,
        isVisibleToUser: true,
      },
      {
        incidentId: incident2.id,
        actorName: "Alex Chen",
        action: "Investigation Commenced",
        description: "Technician verified file isolation; checking connected network shares for lateral attempts.",
        statusFrom: IncidentStatus.ASSIGNED,
        statusTo: IncidentStatus.INVESTIGATING,
        isVisibleToUser: true,
      },
    ],
  });

  // SCENARIO 3: Escalated Phishing Incident
  const incident3 = await prisma.incident.create({
    data: {
      organizationId: acmeOrg.id,
      title: "Targeted Spear-Phishing Campaign Against Executive Leadership",
      description: "Inbound emails masquerading as CEO wire request detected targeting 6 employees. Spoofed domain acme-corp-finance.com.",
      plainLanguageSummary: "A deceptive email campaign targeting leadership was intercepted.",
      severity: IncidentSeverity.CRITICAL,
      category: ThreatCategory.EMAIL,
      status: IncidentStatus.ASSIGNED,
      secondaryStatus: SecondaryStatus.ESCALATED,
      isDemo: true,
    },
  });

  const assignment3 = await prisma.assignment.create({
    data: {
      incidentId: incident3.id,
      technicianId: alexProfile.id,
      status: AssignmentStatus.ESCALATED,
      isPrimary: false,
      assignedAt: new Date(Date.now() - 45 * 60 * 1000),
      notes: "Missed initial acknowledgment SLA.",
    },
  });

  // Backup assignment
  await prisma.assignment.create({
    data: {
      incidentId: incident3.id,
      technicianId: elenaProfile.id,
      status: AssignmentStatus.ACKNOWLEDGED,
      isPrimary: true,
      assignedAt: new Date(Date.now() - 20 * 60 * 1000),
      acknowledgedAt: new Date(Date.now() - 18 * 60 * 1000),
      notes: "Assigned as on-call escalation backup.",
    },
  });

  await prisma.escalationAttempt.create({
    data: {
      incidentId: incident3.id,
      assignmentId: assignment3.id,
      policyId: criticalPolicy.id,
      targetTechnicianId: elenaProfile.id,
      wasAcknowledged: true,
      acknowledgedAt: new Date(Date.now() - 18 * 60 * 1000),
    },
  });

  await prisma.timelineEvent.createMany({
    data: [
      {
        incidentId: incident3.id,
        actorName: "Email Security Gateway",
        action: "Spear-phishing Campaign Intercepted",
        description: "Inbound malicious emails quarantined at mail gateway.",
        statusTo: IncidentStatus.DETECTED,
        isVisibleToUser: true,
      },
      {
        incidentId: incident3.id,
        actorName: "SLA Escalation Engine",
        action: "Missed Acknowledgment Escalation",
        description: "Primary technician missed 15m window. Re-routed to backup: Elena Rostova.",
        statusFrom: IncidentStatus.ASSIGNED,
        statusTo: IncidentStatus.ASSIGNED,
        isVisibleToUser: false,
      },
      {
        incidentId: incident3.id,
        actorName: "Elena Rostova",
        action: "Escalation Acknowledged",
        description: "Backup technician accepted incident and initiated domain-wide mailbox purge.",
        statusFrom: IncidentStatus.ASSIGNED,
        statusTo: IncidentStatus.INVESTIGATING,
        isVisibleToUser: true,
      },
    ],
  });

  // SCENARIO 4: Grouped Duplicate Telemetry
  const incident4 = await prisma.incident.create({
    data: {
      organizationId: acmeOrg.id,
      title: "Automated Credential Spraying Against Remote Gateway",
      description: "Repeated authentication failures detected across 18 unique user handles originating from TOR exit subnet 198.51.100.0/24.",
      plainLanguageSummary: "Automated sign-in attempts were repelled at our remote access gateway.",
      severity: IncidentSeverity.MEDIUM,
      category: ThreatCategory.NETWORK,
      status: IncidentStatus.CONTAINED,
      isDemo: true,
      containedAt: new Date(Date.now() - 50 * 60 * 1000),
    },
  });

  // Add multiple security events grouped into this incident
  await prisma.securityEvent.createMany({
    data: [
      {
        organizationId: acmeOrg.id,
        incidentId: incident4.id,
        source: EventSource.SIMULATOR,
        category: ThreatCategory.NETWORK,
        normalizedTitle: "Failed Password Spray Attempt #1",
        normalizedDescription: "Failed sign-in attempt from 198.51.100.12",
        severity: IncidentSeverity.MEDIUM,
        sourceIp: "198.51.100.12",
        targetAsset: "VPN Gateway Node 01",
      },
      {
        organizationId: acmeOrg.id,
        incidentId: incident4.id,
        source: EventSource.SIMULATOR,
        category: ThreatCategory.NETWORK,
        normalizedTitle: "Failed Password Spray Attempt #2",
        normalizedDescription: "Failed sign-in attempt from 198.51.100.14",
        severity: IncidentSeverity.MEDIUM,
        sourceIp: "198.51.100.14",
        targetAsset: "VPN Gateway Node 01",
      },
      {
        organizationId: acmeOrg.id,
        incidentId: incident4.id,
        source: EventSource.SIMULATOR,
        category: ThreatCategory.NETWORK,
        normalizedTitle: "Failed Password Spray Attempt #3",
        normalizedDescription: "Failed sign-in attempt from 198.51.100.18",
        severity: IncidentSeverity.MEDIUM,
        sourceIp: "198.51.100.18",
        targetAsset: "VPN Gateway Node 01",
      },
    ],
  });

  await prisma.timelineEvent.create({
    data: {
      incidentId: incident4.id,
      actorName: "Noise Reduction Engine",
      action: "Duplicate Telemetry Events Grouped",
      description: "Correlated 3 matching perimeter brute-force events into one case to prevent alert fatigue.",
      statusTo: IncidentStatus.CONTAINED,
      isVisibleToUser: true,
    },
  });

  // SCENARIO 5: Verified & Resolved Incident
  const incident5 = await prisma.incident.create({
    data: {
      organizationId: acmeOrg.id,
      title: "Outdated Web Server Open SSL Vulnerability Remediated",
      description: "Staging server dev-api.acme-corp.demo had TLS 1.0 enabled with vulnerable cipher suite. Package upgraded and config refreshed.",
      plainLanguageSummary: "A server configuration weakness was safely updated and closed.",
      severity: IncidentSeverity.LOW,
      category: ThreatCategory.APPLICATION,
      status: IncidentStatus.RESOLVED,
      resolvedAt: new Date(Date.now() - 120 * 60 * 1000),
      isDemo: true,
    },
  });

  await prisma.incidentResolution.create({
    data: {
      incidentId: incident5.id,
      resolvedById: alexTech.id,
      summary: "TLS 1.0 disabled across all reverse proxies; updated to modern TLS 1.3 configuration. Synthetic handshake verified.",
      rootCause: "Legacy configuration retained after previous staging environment deployment.",
      actionsTaken: "Updated NGINX ssl_protocols directive to exclude TLS 1.0/1.1; reloaded systemd service.",
      preventionSteps: "Added infrastructure-as-code linting rule in GitHub Actions to block cipher downgrades.",
      verifiedAt: new Date(Date.now() - 110 * 60 * 1000),
      verifiedById: alexTech.id,
    },
  });

  await prisma.timelineEvent.createMany({
    data: [
      {
        incidentId: incident5.id,
        actorName: "Vulnerability Scanner",
        action: "Weak Cipher Flagged",
        description: "TLS 1.0 detected on port 443.",
        statusTo: IncidentStatus.DETECTED,
        isVisibleToUser: true,
      },
      {
        incidentId: incident5.id,
        actorName: "Alex Chen",
        action: "Remediation Applied & Verified",
        description: "Modern TLS profile applied. Automated scanner re-tested with 100% pass score.",
        statusFrom: IncidentStatus.INVESTIGATING,
        statusTo: IncidentStatus.RESOLVED,
        isVisibleToUser: true,
      },
    ],
  });

  // 8. Notifications for Sarah
  await prisma.notification.createMany({
    data: [
      {
        userId: sarahUser.id,
        organizationId: acmeOrg.id,
        incidentId: incident1.id,
        title: "Unfamiliar Sign-in Attempt",
        body: "We noticed a sign-in attempt from an unfamiliar location. Please confirm whether this was you.",
        severity: IncidentSeverity.HIGH,
        channel: NotificationType.IN_APP,
        isRead: false,
      },
      {
        userId: sarahUser.id,
        organizationId: acmeOrg.id,
        incidentId: incident2.id,
        title: "Device Threat Contained",
        body: "A suspicious file was quarantined on your workstation. Our team is finalizing safety checks.",
        severity: IncidentSeverity.CRITICAL,
        channel: NotificationType.IN_APP,
        isRead: true,
      },
    ],
  });

  // 9. Security Recommendations
  await prisma.securityRecommendation.createMany({
    data: [
      {
        organizationId: acmeOrg.id,
        title: "Enable FIDO2 Hardware Security Keys for Finance",
        description: "Upgrade from SMS/push prompts to phishing-resistant security keys to eliminate credential interception risks.",
        priority: IncidentSeverity.HIGH,
        category: "Identity Protection",
        isCompleted: false,
      },
      {
        organizationId: acmeOrg.id,
        title: "Enforce Automated Inactivity Screen Lock",
        description: "Configure MDM policy to lock workstation screens after 5 minutes of inactivity.",
        priority: IncidentSeverity.MEDIUM,
        category: "Endpoint Hygiene",
        isCompleted: true,
        completedAt: new Date(),
      },
      {
        organizationId: acmeOrg.id,
        title: "Audit External Cloud Storage Sharing Links",
        description: "Set an automatic 30-day expiration policy on all public file sharing URLs.",
        priority: IncidentSeverity.LOW,
        category: "Data Loss Prevention",
        isCompleted: false,
      },
    ],
  });

  // 10. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        organizationId: acmeOrg.id,
        userId: jordanAdmin.id,
        action: "ESCALATION_POLICY_UPDATED",
        resource: "EscalationPolicy",
        details: { policyName: "Critical 15-Minute SLA", deadlineMinutes: 15 },
      },
      {
        organizationId: acmeOrg.id,
        userId: alexTech.id,
        action: "INCIDENT_STATUS_CHANGE",
        resource: "Incident",
        resourceId: incident2.id,
        details: { from: "ASSIGNED", to: "INVESTIGATING" },
      },
    ],
  });

  console.log("✓ All 5 interactive demo scenarios and initial data seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
