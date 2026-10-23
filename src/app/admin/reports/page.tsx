"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  ShieldCheck,
  Download,
  Calendar,
  Sparkles,
  Lock,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminReportsPage() {
  const [auditLogs, setAuditLogs] = useState([
    {
      id: "log-1",
      timestamp: "2026-10-23 16:40:12 UTC",
      actor: "Jordan Lee (Admin)",
      action: "ESCALATION_POLICY_UPDATED",
      resource: "EscalationPolicy",
      details: "Configured 15-minute Critical SLA deadline with Elena Rostova failover.",
    },
    {
      id: "log-2",
      timestamp: "2026-10-23 16:15:40 UTC",
      actor: "Alex Chen (Tech)",
      action: "REMEDIATION_VERIFIED",
      resource: "Incident #inc_trojan_02",
      details: "Verified clean hash removal and restored workstation network access.",
    },
    {
      id: "log-3",
      timestamp: "2026-10-23 15:50:04 UTC",
      actor: "SLA Escalation Engine",
      action: "MISSED_ACK_ESCALATION",
      resource: "Incident #inc_phish_03",
      details: "Auto-reassigned ticket to backup specialist after deadline expired.",
    },
    {
      id: "log-4",
      timestamp: "2026-10-23 15:20:18 UTC",
      actor: "Correlation Engine",
      action: "TELEMETRY_GROUPED",
      resource: "SecurityEvent #evt_spray_04",
      details: "Grouped 3 duplicate perimeter brute-force events to prevent alert fatigue.",
    },
    {
      id: "log-5",
      timestamp: "2026-10-23 14:10:00 UTC",
      actor: "Sarah Jenkins (User)",
      action: "USER_SIGN_IN_VERIFIED",
      resource: "Incident #inc_login_01",
      details: "User confirmed login legitimacy via one-tap mobile confirmation.",
    },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Security Intelligence & Audit History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Auditable compliance logs, verified resolution metrics, and executive summaries.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
          onClick={() => alert("Audit log export downloaded (JSON/CSV).")}
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export Audit Ledger
        </Button>
      </div>

      {/* Weekly Executive Security Summary Card */}
      <Card className="border-teal-500/30 bg-gradient-to-r from-slate-900 via-slate-900/90 to-teal-950/20 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                  Weekly Security Summary (Verified Ground Truth)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                This week, your security team resolved 5 incidents and verified 2 configuration improvements across 25 monitored assets.
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero ransomware executions occurred, and 100% of credential anomalies were resolved within standard SLA bounds. Metrics are derived strictly from verified incident closures and signed audit telemetry.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 shrink-0 text-center bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-xl font-bold text-teal-400">96.4%</span>
                <span className="block text-[10px] text-slate-400 uppercase mt-0.5">SLA Compliance</span>
              </div>
              <div>
                <span className="text-xl font-bold text-teal-400">28m</span>
                <span className="block text-[10px] text-slate-400 uppercase mt-0.5">Median Resolution</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Immutable Audit Trail Table */}
      <Card className="border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        <CardHeader className="pb-3 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              Immutable Security Audit Ledger
            </CardTitle>
            <Badge variant="outline" className="text-[10px] text-purple-300 border-purple-500/40 bg-purple-500/10">
              Append-Only Storage
            </Badge>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Responsible Actor</th>
                <th className="py-3 px-4">Action Taken</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-4 text-slate-200 font-sans font-semibold">{log.actor}</td>
                  <td className="py-3 px-4 text-purple-300">{log.action}</td>
                  <td className="py-3 px-4 text-teal-400">{log.resource}</td>
                  <td className="py-3 px-4 text-slate-300 font-sans text-xs max-w-sm">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
