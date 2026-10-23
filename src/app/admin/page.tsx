"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Wrench,
  Clock,
  ArrowRight,
  TrendingUp,
  Sliders,
  Webhook,
  Activity,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { StatusBadge } from "@/components/shared/status-badge";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/metrics").then((r) => r.json()),
      fetch("/api/incidents").then((r) => r.json()),
    ])
      .then(([metricsData, incidentsData]) => {
        setMetrics(metricsData);
        setIncidents(incidentsData.incidents || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const activeIncidents = incidents.filter(
    (i) => !["RESOLVED", "CLOSED"].includes(i.status)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-purple-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrative Command Center
            </span>
            <Badge variant="outline" className="text-[10px] text-purple-300 border-purple-500/30 bg-purple-500/10">
              Acme Corporation (Tenant ID: acme-corp)
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Organization Security Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor response performance, team workloads, active risk posture, and organizational SLA adherence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="border-slate-800 bg-slate-900 text-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Metrics
          </Button>
          <Link href="/admin/escalation">
            <Button size="sm" variant="secondary" className="text-xs">
              <Sliders className="w-3.5 h-3.5 mr-1.5" />
              SLA Policies
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Security Incidents"
          value={metrics?.counts?.active ?? activeIncidents.length}
          description="Under active triage or response"
          icon={ShieldAlert}
          highlightColor="amber"
          trend={{ value: "-2 from yesterday", direction: "down", label: "improvement" }}
        />
        <StatCard
          title="SLA Compliance Rate"
          value={`${metrics?.performance?.slaComplianceRate ?? 96.4}%`}
          description="Acknowledged within policy SLA"
          icon={CheckCircle2}
          highlightColor="teal"
          trend={{ value: "+1.2% this month", direction: "up", label: "target met" }}
        />
        <StatCard
          title="Median Ack Time"
          value={`${metrics?.performance?.avgAckMinutes ?? 4}m`}
          description="Target: under 15 minutes"
          icon={Clock}
          highlightColor="blue"
        />
        <StatCard
          title="Continuous Monitoring"
          value={`${metrics?.performance?.monitoringCoverage ?? 98.2}%`}
          description="Endpoints, Cloud & Identity"
          icon={Activity}
          highlightColor="purple"
        />
      </div>

      {/* 2-Column: Active Incidents by Severity + Technician Team Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Incidents Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-white">
                  Active Incidents Requiring SOC Response ({activeIncidents.length})
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live incident queue sorted by priority
                </p>
              </div>
              <Link
                href="/admin/incidents"
                className="text-xs text-purple-400 hover:text-purple-300 font-medium inline-flex items-center gap-1"
              >
                <span>View Full Roster</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-800/80">
                {activeIncidents.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No active incidents. Systems are calm and protected.
                  </div>
                ) : (
                  activeIncidents.map((inc) => {
                    const tech = inc.assignments?.[0]?.technician?.user;
                    return (
                      <div
                        key={inc.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/20 px-2 rounded-lg transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <SeverityBadge severity={inc.severity} />
                            <StatusBadge status={inc.status} />
                            {inc.secondaryStatus && (
                              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                {inc.secondaryStatus}
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-sm text-white">
                            {inc.title}
                          </div>
                          <div className="text-xs text-slate-400">
                            Affected: <strong className="text-slate-300">{inc.affectedUser?.name || "Perimeter Network"}</strong> · Assigned to: <strong className="text-slate-300">{tech?.name || "Unassigned"}</strong>
                          </div>
                        </div>

                        <Link href={`/technician/incidents/${inc.id}`} className="shrink-0">
                          <Button size="sm" variant="ghost" className="h-8 text-xs text-purple-300 hover:text-white">
                            Inspect
                          </Button>
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Technician Workloads & Team Capacity */}
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-purple-400" />
                  Technician Roster & Workload
                </CardTitle>
                <Link
                  href="/admin/technicians"
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  Manage
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(metrics?.technicians || []).map((tech: any) => {
                const loadPercent = Math.round((tech.currentLoad / tech.maxCapacity) * 100);
                return (
                  <div key={tech.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                          {tech.name}
                          {tech.isOnCall && (
                            <span className="text-[9px] text-teal-400 bg-teal-500/10 px-1 py-0.5 rounded border border-teal-500/20">
                              On-Call
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {tech.email}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-200">
                          {tech.currentLoad} / {tech.maxCapacity}
                        </span>
                        <span className="block text-[10px] text-slate-500">tickets</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${loadPercent > 80 ? "bg-red-400" : "bg-teal-400"}`}
                        style={{ width: `${Math.min(loadPercent, 100)}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {tech.specializations.map((s: string) => (
                        <span key={s} className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Integration Health */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                <Webhook className="w-4 h-4 text-teal-400" />
                Active Telemetry Connectors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-300">Signed Event Webhook</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-300">Identity Guard (Okta / Entra)</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-300">Host EDR Agents</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 24 Active
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
