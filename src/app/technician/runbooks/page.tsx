"use client";

import React, { useState } from "react";
import {
  FileText,
  KeyRound,
  Laptop,
  Mail,
  Wifi,
  Database,
  Code2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TechnicianRunbooksPage() {
  const [expandedId, setExpandedId] = useState<string>("rb1");

  const runbooks = [
    {
      id: "rb1",
      code: "SEC-RB-01",
      title: "Suspicious Authentication & Credential Compromise",
      category: "IDENTITY",
      severity: "CRITICAL / HIGH",
      sla: "15 minutes",
      steps: [
        "Correlate sign-in IP against ASN threat feeds and TOR exit node directories.",
        "Check user's last 5 legitimate sessions for geo-velocity impossibilities (e.g. Chicago to Amsterdam in 45m).",
        "Verify user's MFA challenge response (prompt spam vs valid push token).",
        "If confirmed unauthorized, revoke all active OAuth refresh tokens immediately via single sign-on API.",
        "Trigger forced password reset requiring FIDO2 WebAuthn or IT helpdesk re-verification.",
        "Audit Azure AD / Okta sign-in logs for subsequent lateral movement attempts within a 2-hour window.",
      ],
    },
    {
      id: "rb2",
      code: "SEC-RB-04",
      title: "Host-level Malware & Suspicious Process Containment",
      category: "ENDPOINT",
      severity: "CRITICAL",
      sla: "15 minutes",
      steps: [
        "Verify binary SHA-256 hash against internal threat intelligence database and VirusTotal API.",
        "Inspect process parent-child execution tree and command-line arguments in EDR telemetry.",
        "Verify host network isolation status in EDR console (allow only SOC management tunnel).",
        "Examine persistence mechanisms: registry Run keys, systemd timers, scheduled tasks, or startup folders.",
        "Collect memory dump and volatile forensic artifacts before rebooting target asset.",
        "Verify that remote file deletion has quarantined the executable across all synced network shares.",
      ],
    },
    {
      id: "rb3",
      code: "SEC-RB-07",
      title: "Business Email Compromise & Spear-Phishing Triage",
      category: "EMAIL",
      severity: "HIGH",
      sla: "30 minutes",
      steps: [
        "Inspect raw RFC 822 email headers for SPF, DKIM, and DMARC alignment failures.",
        "Extract and safely detonate embedded URLs in isolated browser isolation sandbox.",
        "Search tenant mailbox database using message-trace API for identical subject lines or sender envelopes.",
        "Purge malicious message from all recipient inboxes across the corporate domain.",
        "Add sender domain and source IP to edge email security gateway blackhole list.",
      ],
    },
    {
      id: "rb4",
      code: "SEC-RB-12",
      title: "Perimeter Network Anomaly & Command-and-Control Triage",
      category: "NETWORK",
      severity: "MEDIUM / HIGH",
      sla: "60 minutes",
      steps: [
        "Review NetFlow/IPFIX logs for connection duration and abnormal outbound byte ratios.",
        "Query internal DNS resolver logs for high-entropy dynamic DNS domain lookups.",
        "Deploy temporary edge firewall ACL blocking destination CIDR range.",
        "Inspect local host generating the traffic for potential reverse-shell beacons.",
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Standard Security Runbooks
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Standardized, audited diagnostic procedures for rapid incident containment and verifiable resolution.
        </p>
      </div>

      <div className="space-y-4">
        {runbooks.map((rb) => {
          const isExpanded = expandedId === rb.id;
          return (
            <Card
              key={rb.id}
              className={`border-slate-800 transition-all ${
                isExpanded ? "bg-slate-900/90 border-amber-500/30" : "bg-slate-900/50 hover:bg-slate-900/70"
              }`}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? "" : rb.id)}
                className="p-5 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-amber-400 font-mono text-xs font-semibold">
                    {rb.code.split("-")[2]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-amber-400 font-semibold">{rb.code}</span>
                      <Badge variant="outline" className="text-[10px] text-slate-300 border-slate-700">
                        {rb.category}
                      </Badge>
                      <span className="text-[11px] text-slate-500">SLA: {rb.sla}</span>
                    </div>
                    <h3 className="font-semibold text-base text-white mt-0.5">
                      {rb.title}
                    </h3>
                  </div>
                </div>

                <div className="text-slate-400">
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800 space-y-3">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Mandatory Investigation Steps:
                  </span>
                  <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-300 font-mono">
                    {rb.steps.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
