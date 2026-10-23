// =============================================================================
// SecureFlow – App-wide constants & Configuration
// =============================================================================

export const APP_NAME = "SecureFlow" as const;
export const APP_TAGLINE = "Your security, managed intelligently." as const;
export const APP_DESCRIPTION = "From security alerts to security confidence. Intelligent incident detection, routing, and resolution." as const;

// ---------------------------------------------------------------------------
// Severity Configuration
// ---------------------------------------------------------------------------

export type IncidentSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";

export interface SeverityConfigEntry {
  label: string;
  userLabel: string;
  color: string;
  bgLight: string;
  border: string;
  badgeClass: string;
  icon: string;
  description: string;
}

export const SEVERITY_CONFIG: Record<IncidentSeverity, SeverityConfigEntry> = {
  CRITICAL: {
    label: "Critical",
    userLabel: "Urgent Attention Needed",
    color: "text-red-400",
    bgLight: "bg-red-500/10",
    border: "border-red-500/20",
    badgeClass: "bg-red-500/15 text-red-400 border-red-500/30",
    icon: "AlertOctagon",
    description: "Requires immediate intervention to prevent severe disruption or compromise.",
  },
  HIGH: {
    label: "High",
    userLabel: "Action Recommended",
    color: "text-amber-400",
    bgLight: "bg-amber-500/10",
    border: "border-amber-500/20",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: "AlertTriangle",
    description: "Significant security event that poses substantial risk if left unaddressed.",
  },
  MEDIUM: {
    label: "Medium",
    userLabel: "Review Suggested",
    color: "text-yellow-400",
    bgLight: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    badgeClass: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    icon: "AlertCircle",
    description: "Suspicious behavior or policy deviation warranting investigation.",
  },
  LOW: {
    label: "Low",
    userLabel: "Notice",
    color: "text-blue-400",
    bgLight: "bg-blue-500/10",
    border: "border-blue-500/20",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    icon: "Info",
    description: "Minor anomaly or informational security alert with minimal risk.",
  },
  INFORMATIONAL: {
    label: "Info",
    userLabel: "Information Only",
    color: "text-slate-400",
    bgLight: "bg-slate-500/10",
    border: "border-slate-500/20",
    badgeClass: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    icon: "ShieldAlert",
    description: "Informational audit event or expected system change.",
  },
};

// ---------------------------------------------------------------------------
// Incident Status Configuration
// ---------------------------------------------------------------------------

export type IncidentStatus =
  | "DETECTED"
  | "TRIAGED"
  | "ASSIGNED"
  | "ACKNOWLEDGED"
  | "INVESTIGATING"
  | "CONTAINED"
  | "RESOLVED"
  | "CLOSED"
  | "REOPENED";

export interface StatusConfigEntry {
  label: string;
  userLabel: string;
  color: string;
  badgeClass: string;
  stepIndex: number;
  description: string;
}

export const INCIDENT_STATUS_CONFIG: Record<IncidentStatus, StatusConfigEntry> = {
  DETECTED: {
    label: "Detected",
    userLabel: "Flagged by System",
    color: "text-purple-400",
    badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    stepIndex: 0,
    description: "Security signal detected and awaiting automated or manual triage.",
  },
  TRIAGED: {
    label: "Triaged",
    userLabel: "Assessing Priority",
    color: "text-indigo-400",
    badgeClass: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    stepIndex: 1,
    description: "Threat categorized and severity determined.",
  },
  ASSIGNED: {
    label: "Assigned",
    userLabel: "Technician Assigned",
    color: "text-sky-400",
    badgeClass: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    stepIndex: 2,
    description: "Routed to a specialized security technician.",
  },
  ACKNOWLEDGED: {
    label: "Acknowledged",
    userLabel: "Technician Accepted",
    color: "text-blue-400",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    stepIndex: 3,
    description: "Technician accepted ownership and is preparing investigation.",
  },
  INVESTIGATING: {
    label: "Investigating",
    userLabel: "Investigation in Progress",
    color: "text-amber-400",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    stepIndex: 4,
    description: "Active diagnostic and forensic analysis underway.",
  },
  CONTAINED: {
    label: "Contained",
    userLabel: "Threat Isolated",
    color: "text-emerald-400",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    stepIndex: 5,
    description: "Threat neutralized or affected assets isolated.",
  },
  RESOLVED: {
    label: "Resolved",
    userLabel: "Issue Resolved",
    color: "text-teal-400",
    badgeClass: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    stepIndex: 6,
    description: "Remediation verified and protective safeguards restored.",
  },
  CLOSED: {
    label: "Closed",
    userLabel: "Closed",
    color: "text-slate-400",
    badgeClass: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    stepIndex: 7,
    description: "Case closed after post-incident review and confirmation.",
  },
  REOPENED: {
    label: "Reopened",
    userLabel: "Re-examining Case",
    color: "text-rose-400",
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    stepIndex: 4,
    description: "Investigation reopened due to new evidence or recurring telemetry.",
  },
};

// ---------------------------------------------------------------------------
// Threat Category Configuration
// ---------------------------------------------------------------------------

export type ThreatCategory =
  | "IDENTITY"
  | "ENDPOINT"
  | "NETWORK"
  | "EMAIL"
  | "DATA"
  | "APPLICATION"
  | "CLOUD"
  | "PHYSICAL"
  | "OTHER";

export interface ThreatCategoryConfigEntry {
  label: string;
  icon: string;
  technicianRole: string;
  description: string;
}

export const THREAT_CATEGORY_CONFIG: Record<ThreatCategory, ThreatCategoryConfigEntry> = {
  IDENTITY: {
    label: "Identity & Access",
    icon: "KeyRound",
    technicianRole: "Identity Security Specialist",
    description: "Sign-in anomalies, credential stuffing, MFA fatigue, unauthorized access.",
  },
  ENDPOINT: {
    label: "Endpoint Protection",
    icon: "Laptop",
    technicianRole: "Endpoint Security Specialist",
    description: "Malware execution, suspicious processes, device tampering, EDR detections.",
  },
  NETWORK: {
    label: "Network Security",
    icon: "Wifi",
    technicianRole: "Network Security Specialist",
    description: "Firewall anomalies, port scanning, abnormal egress traffic, DDoS attempts.",
  },
  EMAIL: {
    label: "Email & Phishing",
    icon: "Mail",
    technicianRole: "Email Security Specialist",
    description: "Spear phishing, malicious attachments, suspicious links, spoofed senders.",
  },
  DATA: {
    label: "Data Protection",
    icon: "Database",
    technicianRole: "Data Protection Specialist",
    description: "Bulk exfiltration, DLP violations, unauthorized sensitive data access.",
  },
  APPLICATION: {
    label: "App Security",
    icon: "Code2",
    technicianRole: "Application Security Engineer",
    description: "API abuse, injection attempts, auth bypasses, CSRF / XSS attempts.",
  },
  CLOUD: {
    label: "Cloud Infrastructure",
    icon: "Cloud",
    technicianRole: "Cloud Security Specialist",
    description: "IAM role escalation, open S3 buckets, anomalous cloud resource spinning.",
  },
  PHYSICAL: {
    label: "Physical Security",
    icon: "Building2",
    technicianRole: "Operations Security",
    description: "Badge access anomalies, unauthorized server room access.",
  },
  OTHER: {
    label: "General Security",
    icon: "ShieldAlert",
    technicianRole: "General Security Analyst",
    description: "Cross-category or unclassified security alerts.",
  },
};

// ---------------------------------------------------------------------------
// User Roles Configuration
// ---------------------------------------------------------------------------

export type UserRole = "USER" | "TECHNICIAN" | "ADMIN" | "MSSP_ADMIN";

export interface RoleConfigEntry {
  label: string;
  description: string;
  defaultPath: string;
}

export const ROLE_CONFIG: Record<UserRole, RoleConfigEntry> = {
  USER: {
    label: "Everyday User",
    description: "Access personal security status, alert notifications, and support chat.",
    defaultPath: "/dashboard",
  },
  TECHNICIAN: {
    label: "Security Technician",
    description: "Desktop incident investigation workspace, queue triage, and runbooks.",
    defaultPath: "/technician",
  },
  ADMIN: {
    label: "Organization Administrator",
    description: "Full management of organization security, teams, rules, and reports.",
    defaultPath: "/admin",
  },
  MSSP_ADMIN: {
    label: "MSSP Provider Admin",
    description: "Multi-tenant managed service operations across customer organizations.",
    defaultPath: "/admin",
  },
};
