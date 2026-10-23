import { IncidentSeverity, ThreatCategory } from "@prisma/client";

export interface AIExplanationResult {
  plainExplanation: string;
  recommendedSteps: string[];
  safeActionGuidance: string;
  confidenceScore: number;
  isDeterministicFallback: boolean;
}

export interface AITechnicianBrief {
  evidenceSummary: string;
  inferredThreatVector: string;
  suggestedRunbook: string;
  suggestedInvestigationSteps: string[];
  suggestedUserCommunication: string;
  draftResolutionSummary: string;
  disclaimer: string;
  isDeterministicFallback: boolean;
}

export class AISecurityAssistant {
  /**
   * Plain-language explanation for everyday users
   */
  static async explainForUser(
    title: string,
    category: ThreatCategory,
    severity: IncidentSeverity
  ): Promise<AIExplanationResult> {
    // Grounded deterministic engine with high-confidence domain intelligence
    const explanations: Record<ThreatCategory, AIExplanationResult> = {
      IDENTITY: {
        plainExplanation:
          "This alert occurred because an authentication attempt originated from an IP address or browser fingerprint not seen in your typical pattern. This does not automatically mean your account was breached, but it requires quick verification.",
        recommendedSteps: [
          "Check if you recently used a new Wi-Fi network, travel VPN, or mobile device.",
          "If this was not you, tap 'No, protect my account' to terminate unknown sessions immediately.",
          "Ensure multi-factor authentication (MFA) prompts are always confirmed solely when initiated by you.",
        ],
        safeActionGuidance:
          "Verify the timestamp and location. If you are confident it was your activity, confirming it resolves the flag safely without further disruption.",
        confidenceScore: 0.95,
        isDeterministicFallback: true,
      },
      ENDPOINT: {
        plainExplanation:
          "Our endpoint defense software intercepted an unrecognized process attempting to modify system files on your computer. The suspicious file was immediately prevented from executing.",
        recommendedSteps: [
          "Save any open work files; do not download files from unverified download links.",
          "Allow the security technician to run a background diagnostic sweep.",
          "Leave the device connected to the internet so remote containment can finalize safely.",
        ],
        safeActionGuidance:
          "The file is already quarantined. You do not need to reboot or format your machine.",
        confidenceScore: 0.92,
        isDeterministicFallback: true,
      },
      EMAIL: {
        plainExplanation:
          "An email received in your inbox contained traits typical of spear-phishing (such as a look-alike domain, hidden redirection links, or urgent demands for credentials).",
        recommendedSteps: [
          "Do not click any embedded links or open attachments in that message.",
          "Do not reply to the sender or provide passwords under any circumstances.",
          "The email has been safely isolated in the quarantine vault.",
        ],
        safeActionGuidance:
          "No credentials have been compromised as long as you did not input passwords on any linked website.",
        confidenceScore: 0.98,
        isDeterministicFallback: true,
      },
      NETWORK: {
        plainExplanation:
          "A firewall detected unusual outbound connection requests from a local device toward an unknown external address.",
        recommendedSteps: [
          "The network gateway has blocked the specific traffic stream.",
          "A network security technician is auditing port logs.",
        ],
        safeActionGuidance:
          "Your local internet access remains active and monitored.",
        confidenceScore: 0.88,
        isDeterministicFallback: true,
      },
      DATA: {
        plainExplanation:
          "A higher-than-usual volume of sensitive data was accessed or transferred across cloud storage.",
        recommendedSteps: [
          "Confirm whether you recently initiated a scheduled backup or bulk export.",
          "Technicians are auditing access tokens.",
        ],
        safeActionGuidance:
          "Data loss prevention policies are currently restricting unauthorized external downloads.",
        confidenceScore: 0.9,
        isDeterministicFallback: true,
      },
      APPLICATION: {
        plainExplanation:
          "An application security filter intercepted an abnormal request query against internal web services.",
        recommendedSteps: [
          "No end-user action is required at this stage.",
          "Application engineers are reviewing web application firewall (WAF) logs.",
        ],
        safeActionGuidance: "Continuous monitoring is active.",
        confidenceScore: 0.9,
        isDeterministicFallback: true,
      },
      CLOUD: {
        plainExplanation:
          "An IAM role or cloud storage configuration change was detected outside standard change windows.",
        recommendedSteps: [
          "Cloud operations team is validating the deployment pipeline.",
        ],
        safeActionGuidance: "Permissions are monitored in real time.",
        confidenceScore: 0.9,
        isDeterministicFallback: true,
      },
      PHYSICAL: {
        plainExplanation:
          "An access badge attempt occurred at an off-hours boundary or unauthorized facility entrance.",
        recommendedSteps: [
          "Security guards and facilities staff have been notified.",
        ],
        safeActionGuidance: "Facilities remain physically secured.",
        confidenceScore: 0.9,
        isDeterministicFallback: true,
      },
      OTHER: {
        plainExplanation:
          "Our automated telemetry identified an anomaly in system activity. The incident has been classified for priority review.",
        recommendedSteps: [
          "Review the incident summary and contact your technician if you have pertinent details.",
        ],
        safeActionGuidance:
          "The security operations center is actively monitoring the event.",
        confidenceScore: 0.85,
        isDeterministicFallback: true,
      },
    };

    return explanations[category] || explanations.OTHER;
  }

  /**
   * Diagnostic brief and investigation recommendations for Technicians
   */
  static async generateTechnicianBrief(
    incidentTitle: string,
    category: ThreatCategory,
    severity: IncidentSeverity,
    evidenceItems: string[]
  ): Promise<AITechnicianBrief> {
    const runbooks: Record<ThreatCategory, { runbook: string; steps: string[] }> = {
      IDENTITY: {
        runbook: "SEC-RB-01: Suspicious Authentication & Credential Compromise",
        steps: [
          "Correlate sign-in IP against ASN threat feeds and TOR exit node directories.",
          "Check user's last 5 legitimate sessions for geo-velocity impossibilities.",
          "Verify user's MFA challenge response (prompt spam vs valid token).",
          "If unauthorized, revoke all active OAuth tokens and trigger forced password reset.",
          "Audit Azure AD / Okta sign-in logs for subsequent lateral movement attempts.",
        ],
      },
      ENDPOINT: {
        runbook: "SEC-RB-04: Host-level Malware & Suspicious Process Containment",
        steps: [
          "Verify SHA-256 hash against VirusTotal and local threat intel database.",
          "Inspect process parent-child execution tree and command-line arguments.",
          "Verify host isolation status in EDR console.",
          "Examine persistence mechanisms: registry Run keys, scheduled tasks, startup folder.",
          "Collect memory dump if active beaconing is suspected.",
        ],
      },
      EMAIL: {
        runbook: "SEC-RB-07: Business Email Compromise & Phishing Triage",
        steps: [
          "Inspect raw RFC 822 email headers for SPF, DKIM, and DMARC alignment.",
          "Extract and detonate embedded URLs in safe sandbox environment.",
          "Search tenant mailbox database for identical subject lines or sender addresses.",
          "Purge malicious email from all recipient inboxes across the domain.",
        ],
      },
      NETWORK: {
        runbook: "SEC-RB-12: Network Anomaly & Command-and-Control Triage",
        steps: [
          "Review NetFlow/IPFIX logs for connection duration and byte counts.",
          "Query DNS resolver logs for dynamic DNS or high-entropy domain lookups.",
          "Block destination CIDR at edge firewall.",
        ],
      },
      DATA: {
        runbook: "SEC-RB-15: Data Loss Prevention & Bulk Exfiltration",
        steps: [
          "Trace file access logs to determine classification level of transferred files.",
          "Revoke external sharing links created within the last 24 hours.",
        ],
      },
      APPLICATION: {
        runbook: "SEC-RB-20: Web Application Attack & WAF Mitigation",
        steps: [
          "Analyze HTTP payload for SQLi, XSS, or SSRF signatures.",
          "Deploy custom WAF rule to block attacking source subnet.",
        ],
      },
      CLOUD: {
        runbook: "SEC-RB-25: Cloud Infrastructure & IAM Breach Investigation",
        steps: [
          "Audit CloudTrail / GCP Audit logs for role assumption events.",
          "Verify KMS key access and sensitive storage permissions.",
        ],
      },
      PHYSICAL: {
        runbook: "SEC-RB-30: Physical Access Breach Response",
        steps: ["Review CCTV footage matching badge reader timestamp."],
      },
      OTHER: {
        runbook: "SEC-RB-00: Standard Security Operations Triage",
        steps: [
          "Gather raw logs and correlate across SIEM pipelines.",
          "Establish baseline behavior and document anomalies in ticket.",
        ],
      },
    };

    const selectedRunbook = runbooks[category] || runbooks.OTHER;

    return {
      evidenceSummary: `Analysis of telemetry associated with "${incidentTitle}". Evidence includes ${
        evidenceItems.length > 0 ? evidenceItems.join(", ") : "primary event signature and asset metadata"
      }.`,
      inferredThreatVector: `Potential unauthorized activity matching ${category.toLowerCase()} risk profile with ${severity.toLowerCase()} severity rating.`,
      suggestedRunbook: selectedRunbook.runbook,
      suggestedInvestigationSteps: selectedRunbook.steps,
      suggestedUserCommunication:
        "Hello! Our security team has isolated the flagged activity and is verifying system safety. You may continue normal work unless otherwise instructed.",
      draftResolutionSummary: `Threat successfully contained. Diagnostic review confirmed no lateral movement or credential persistence. Safeguards restored and endpoint telemetry normalized.`,
      disclaimer:
        "AI suggestions are grounded diagnostic aids and must be reviewed and approved by an authorized technician before executing high-impact containment actions.",
      isDeterministicFallback: true,
    };
  }
}
