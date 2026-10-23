"use client";

import React, { useState, useEffect } from "react";
import {
  FileBarChart2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  ArrowRight,
  Download,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WeeklyReportPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/report/weekly")
      .then((res) => res.json())
      .then((data) => setReport(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Personalized Security Digest
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-400">Weekly Cadence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileBarChart2 className="h-6 w-6 text-teal-400" />
            Weekly Software Security Report
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Summary of vulnerability exposures, resolved issues, and recommended actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="border-slate-800 text-slate-300 hover:text-white bg-[#111C2E] gap-2 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export / Print Report
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center bg-[#111C2E] rounded-2xl border border-slate-800 text-xs text-slate-400 animate-pulse">
          Generating personalized security report...
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-[#111C2E] rounded-2xl border border-slate-800 text-center space-y-1">
              <div className="text-xs text-slate-400">Monitored Software</div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {report.metrics.totalMonitoredSoftware}
              </div>
              <div className="text-[11px] text-slate-500">
                {report.metrics.totalDependencies} project dependencies
              </div>
            </div>

            <div className="p-5 bg-[#111C2E] rounded-2xl border border-slate-800 text-center space-y-1">
              <div className="text-xs text-red-300 font-medium">Urgent Disclosures</div>
              <div className="text-2xl font-bold text-red-400 tracking-tight">
                {report.metrics.urgentCount}
              </div>
              <div className="text-[11px] text-slate-500">Action required promptly</div>
            </div>

            <div className="p-5 bg-[#111C2E] rounded-2xl border border-slate-800 text-center space-y-1">
              <div className="text-xs text-amber-300 font-medium">Confirmed Vulnerabilities</div>
              <div className="text-2xl font-bold text-amber-400 tracking-tight">
                {report.metrics.confirmedVulnerabilities}
              </div>
              <div className="text-[11px] text-slate-500">Affecting current versions</div>
            </div>

            <div className="p-5 bg-[#111C2E] rounded-2xl border border-slate-800 text-center space-y-1">
              <div className="text-xs text-teal-300 font-medium">Verified Fixes</div>
              <div className="text-2xl font-bold text-teal-400 tracking-tight">
                {report.metrics.verifiedFixedCount}
              </div>
              <div className="text-[11px] text-slate-500">Confirmed resolved this cycle</div>
            </div>
          </div>

          {/* Software Status Breakdown Table */}
          <div className="bg-[#111C2E] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              Software Security Health Overview
            </h3>

            {report.watchlistSummary?.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">
                No software currently in watchlist. Add software from the Search page to populate this report.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#17243A] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Ecosystem</th>
                      <th className="py-2.5 px-3">Monitored Version</th>
                      <th className="py-2.5 px-3">Exposure Status</th>
                      <th className="py-2.5 px-3 text-right">Action Needed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {report.watchlistSummary?.map((item: any) => (
                      <tr key={item.id} className="hover:bg-[#17243A]/40 transition">
                        <td className="py-2.5 px-3 font-semibold text-white">{item.name}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant="outline" className="text-[10px] border-slate-700">
                            {item.ecosystem}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-teal-300">v{item.version}</td>
                        <td className="py-2.5 px-3">
                          {item.activeFindings > 0 ? (
                            <span className="text-red-400 font-semibold flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {item.activeFindings} active {item.activeFindings === 1 ? "vulnerability" : "vulnerabilities"}
                            </span>
                          ) : (
                            <span className="text-teal-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Clear / No findings
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {item.activeFindings > 0 ? (
                            <span className="text-amber-400 font-semibold">Update Recommended</span>
                          ) : (
                            <span className="text-slate-400">Continue monitoring</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Actionable Next Steps */}
          <div className="bg-[#111C2E] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-400" />
              Prioritized Remediation Checklist
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-[#17243A] rounded-xl border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Review Confirmed High-Severity Findings</div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Navigate to your Watchlist to check whether any software in your inventory has verified fixed releases published.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#17243A] rounded-xl border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Confirm Uncertain Versions</div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    For any applications flagged as &quot;Needs verification&quot;, check your installed release number to ensure risk evaluations are accurate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
