"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Search,
  BookmarkCheck,
  FolderGit2,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  Laptop,
  Code2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function DashboardOverviewPage() {
  const [mode, setMode] = useState<"PERSONAL" | "DEVELOPER">("PERSONAL");
  const [loading, setLoading] = useState<boolean>(true);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({
    monitoredCount: 0,
    urgentCount: 0,
    confirmedCount: 0,
    needsVerificationCount: 0,
    availableFixesCount: 0,
    lastCheckTime: "Just now",
  });

  useEffect(() => {
    const saved = localStorage.getItem("secureflow_mode");
    if (saved === "DEVELOPER" || saved === "PERSONAL") {
      setMode(saved);
    }

    const handleModeChange = (e: any) => {
      setMode(e.detail);
    };
    window.addEventListener("secureflow_mode_change", handleModeChange);
    return () => window.removeEventListener("secureflow_mode_change", handleModeChange);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wlRes, projRes] = await Promise.all([
        fetch("/api/watchlist"),
        fetch("/api/projects"),
      ]);

      const wlData = await wlRes.json();
      const projData = await projRes.json();

      const wlItems = wlData.watchlist || [];
      const projItems = projData.projects || [];
      setWatchlist(wlItems);
      setProjects(projItems);

      // Aggregate findings
      let urgent = 0;
      let confirmed = 0;
      let needsVerif = 0;
      let fixes = 0;

      for (const item of wlItems) {
        for (const f of item.findings || []) {
          if (f.status === "CONFIRMED_AFFECTED") {
            confirmed++;
            if (f.priority === "FIX_URGENTLY") urgent++;
            if (f.fixedVersion) fixes++;
          } else if (f.status === "NEEDS_VERIFICATION") {
            needsVerif++;
          }
        }
      }

      for (const p of projItems) {
        for (const d of p.dependencies || []) {
          for (const f of d.findings || []) {
            if (f.status === "CONFIRMED_AFFECTED") {
              confirmed++;
              if (f.priority === "FIX_URGENTLY") urgent++;
              if (f.fixedVersion) fixes++;
            }
          }
        }
      }

      setStats({
        monitoredCount: wlItems.length + projItems.reduce((acc: number, p: any) => acc + (p.totalDependencies || 0), 0),
        urgentCount: urgent,
        confirmedCount: confirmed,
        needsVerificationCount: needsVerif,
        availableFixesCount: fixes,
        lastCheckTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [mode]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
              {mode === "PERSONAL" ? "Personal Protection Center" : "Developer Security Hub"}
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-400">Live OSV Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Here&apos;s the security status of your monitored software.
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracking verified vulnerability disclosures and official security patches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            disabled={loading}
            className="border-slate-800 text-slate-300 hover:text-white bg-[#111C2E] gap-2 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-teal-400" : ""}`} />
            Refresh Status
          </Button>
          <Link href="/dashboard/search">
            <Button
              size="sm"
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold gap-1.5 text-xs shadow-sm shadow-teal-500/20"
            >
              <Search className="h-3.5 w-3.5" />
              Check Software
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Security Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Monitored Software */}
        <div className="bg-[#111C2E] border border-slate-800 rounded-xl p-4.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Monitored Software</span>
            <BookmarkCheck className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{stats.monitoredCount}</div>
          <div className="text-[11px] text-slate-400">
            {watchlist.length} watchlist apps {projects.length > 0 && `+ ${projects.length} dev projects`}
          </div>
        </div>

        {/* Urgent Findings */}
        <div
          className={`border rounded-xl p-4.5 space-y-1 transition ${
            stats.urgentCount > 0
              ? "bg-red-500/10 border-red-500/40"
              : "bg-[#111C2E] border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className={stats.urgentCount > 0 ? "text-red-300 font-medium" : "text-slate-400"}>
              Fix Urgently
            </span>
            <AlertTriangle
              className={`h-4 w-4 ${stats.urgentCount > 0 ? "text-red-400" : "text-slate-500"}`}
            />
          </div>
          <div className={`text-2xl font-bold tracking-tight ${stats.urgentCount > 0 ? "text-red-400" : "text-white"}`}>
            {stats.urgentCount}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats.urgentCount > 0 ? "Known exploited or critical risk" : "Zero active critical threats"}
          </div>
        </div>

        {/* Confirmed Vulnerable */}
        <div
          className={`border rounded-xl p-4.5 space-y-1 ${
            stats.confirmedCount > 0
              ? "bg-amber-500/10 border-amber-500/40"
              : "bg-[#111C2E] border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className={stats.confirmedCount > 0 ? "text-amber-300 font-medium" : "text-slate-400"}>
              Confirmed Applicable
            </span>
            <ShieldCheck
              className={`h-4 w-4 ${stats.confirmedCount > 0 ? "text-amber-400" : "text-slate-500"}`}
            />
          </div>
          <div className={`text-2xl font-bold tracking-tight ${stats.confirmedCount > 0 ? "text-amber-400" : "text-white"}`}>
            {stats.confirmedCount}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats.confirmedCount > 0 ? "Affects your exact installed versions" : "No known issues"}
          </div>
        </div>

        {/* Available Fixes */}
        <div className="bg-[#111C2E] border border-slate-800 rounded-xl p-4.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verified Fixes Available</span>
            <CheckCircle2 className="h-4 w-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-400 tracking-tight">{stats.availableFixesCount}</div>
          <div className="text-[11px] text-slate-400">Vendor patches ready to apply</div>
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          href="/dashboard/search"
          className="group flex items-center justify-between p-3.5 rounded-xl bg-[#17243A] border border-slate-800 hover:border-teal-500/50 transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-300 group-hover:bg-teal-500/20 transition">
              <Search className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Check Software</div>
              <div className="text-[10px] text-slate-400">Lookup any app or package</div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-teal-300 transition" />
        </Link>

        <Link
          href="/dashboard/watchlist"
          className="group flex items-center justify-between p-3.5 rounded-xl bg-[#17243A] border border-slate-800 hover:border-teal-500/50 transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-300 group-hover:bg-teal-500/20 transition">
              <BookmarkCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Software Watchlist</div>
              <div className="text-[10px] text-slate-400">Manage tracked versions</div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-teal-300 transition" />
        </Link>

        <Link
          href="/dashboard/projects"
          className="group flex items-center justify-between p-3.5 rounded-xl bg-[#17243A] border border-slate-800 hover:border-blue-500/50 transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-300 group-hover:bg-blue-500/20 transition">
              <FolderGit2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Import Lockfile</div>
              <div className="text-[10px] text-slate-400">npm, requirements.txt, pnpm</div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-blue-300 transition" />
        </Link>

        <Link
          href="/dashboard/report"
          className="group flex items-center justify-between p-3.5 rounded-xl bg-[#17243A] border border-slate-800 hover:border-teal-500/50 transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-300 group-hover:bg-teal-500/20 transition">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Weekly Report</div>
              <div className="text-[10px] text-slate-400">View progress & audit logs</div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-teal-300 transition" />
        </Link>
      </div>

      {/* Main Content Area: Monitored Software List & Recent Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monitored Software List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookmarkCheck className="h-4 w-4 text-teal-400" />
              Monitored Software ({watchlist.length})
            </h2>
            <Link href="/dashboard/watchlist" className="text-xs text-teal-400 hover:underline">
              View all &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-[#111C2E] rounded-xl border border-slate-800 text-xs text-slate-400 animate-pulse">
              Loading watchlist and real-time vulnerability status...
            </div>
          ) : watchlist.length === 0 ? (
            <div className="p-8 text-center bg-[#111C2E] rounded-xl border border-slate-800 space-y-3">
              <ShieldCheck className="h-8 w-8 text-slate-500 mx-auto" />
              <div className="text-sm font-semibold text-white">No software currently monitored</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add desktop software, browsers, or developer packages to your watchlist to track vulnerability disclosures.
              </p>
              <Link href="/dashboard/search">
                <Button size="sm" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs">
                  Add Your First Software
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {watchlist.map((item) => {
                const confirmed = (item.findings || []).filter((f: any) => f.status === "CONFIRMED_AFFECTED");
                const hasUrgent = confirmed.some((f: any) => f.priority === "FIX_URGENTLY");

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#111C2E] border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{item.name}</span>
                        <span className="text-[11px] font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                          v{item.currentVersion}
                        </span>
                        <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-800">
                          {item.ecosystem}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>Platform: {item.platform || "Desktop"}</span>
                        <span>&bull;</span>
                        <span>
                          Checked: {new Date(item.lastCheckedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {confirmed.length > 0 ? (
                        <span
                          className={`text-xs px-2.5 py-1 rounded font-medium flex items-center gap-1.5 ${
                            hasUrgent
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {confirmed.length} {confirmed.length === 1 ? "vulnerability" : "vulnerabilities"}
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3" />
                          Up to date
                        </span>
                      )}

                      <Link href={`/dashboard/watchlist`}>
                        <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Practical Security Recommendations */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-400" />
            Security Recommendations
          </h2>

          <div className="bg-[#111C2E] border border-slate-800 rounded-xl p-4 space-y-3.5">
            <div className="text-xs text-slate-300 leading-relaxed">
              Transparent guidance prioritized by confirmed vulnerability exposure and active exploit indicators.
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-[#17243A] border border-slate-800">
                <div className="font-semibold text-teal-300 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Keep Version Numbers Accurate
                </div>
                <p className="text-slate-400 text-[11px]">
                  Uncertain version matches are flagged as &apos;Needs verification&apos;. Updating your watchlist with the exact version prevents false alarms.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#17243A] border border-slate-800">
                <div className="font-semibold text-blue-300 mb-1 flex items-center gap-1.5">
                  <FolderGit2 className="h-3.5 w-3.5" /> Developer Dependency Audits
                </div>
                <p className="text-slate-400 text-[11px]">
                  Import your <code className="text-teal-300">package-lock.json</code> to scan direct and transitive dependencies against OSV.dev advisories.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#17243A] border border-slate-800">
                <div className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> One-Tap Fix Verification
                </div>
                <p className="text-slate-400 text-[11px]">
                  After installing a software update, click &quot;I updated this software&quot; to test your new version against known vulnerable ranges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
