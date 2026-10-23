"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  AlertOctagon,
  Clock,
  CheckCircle,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Flame,
  Check,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThreatCategoryBadge } from "@/components/shared/threat-category-badge";
import { StatCard } from "@/components/shared/stat-card";

export default function TechnicianQueuePage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [ackSuccess, setAckSuccess] = useState<string | null>(null);

  const fetchIncidents = () => {
    setLoading(true);
    fetch("/api/incidents")
      .then((res) => res.json())
      .then((data) => setIncidents(data.incidents || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const acknowledgeIncident = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ACKNOWLEDGED",
          actorName: "Alex Chen (SOC L2)",
          notes: "Technician acknowledged case and took ownership.",
        }),
      });
      if (res.ok) {
        setAckSuccess(`Acknowledged "${title}". Case moved to active triage.`);
        fetchIncidents();
        setTimeout(() => setAckSuccess(null), 4000);
      }
    } catch {
      alert("Failed to acknowledge incident");
    }
  };

  // Filter logic
  const filtered = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.category.toLowerCase().includes(search.toLowerCase()) ||
      (inc.affectedUser?.name || "").toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === "PENDING_ACK") {
      return inc.status === "ASSIGNED";
    }
    if (filterTab === "INVESTIGATING") {
      return inc.status === "INVESTIGATING" || inc.status === "ACKNOWLEDGED";
    }
    if (filterTab === "CONTAINED") {
      return inc.status === "CONTAINED";
    }
    if (filterTab === "RESOLVED") {
      return inc.status === "RESOLVED" || inc.status === "CLOSED";
    }
    return true;
  });

  const pendingAckCount = incidents.filter((i) => i.status === "ASSIGNED").length;
  const investigatingCount = incidents.filter((i) => ["INVESTIGATING", "ACKNOWLEDGED"].includes(i.status)).length;
  const criticalCount = incidents.filter((i) => i.severity === "CRITICAL" && !["RESOLVED", "CLOSED"].includes(i.status)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* Technician Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-400 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" />
              SOC Incident Workspace
            </span>
            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
              Shift: Primary On-Call
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Assigned Incident Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Logged in as <strong className="text-slate-200">Alex Chen</strong> (Identity & Endpoint Security Specialist)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchIncidents}
            className="border-slate-800 bg-slate-900 text-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Queue
          </Button>
          <Link href="/technician/runbooks">
            <Button size="sm" variant="secondary" className="text-xs">
              View Runbooks
            </Button>
          </Link>
        </div>
      </div>

      {ackSuccess && (
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{ackSuccess}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Acknowledgment"
          value={pendingAckCount}
          description="SLA clock ticking"
          icon={Clock}
          highlightColor={pendingAckCount > 0 ? "amber" : "teal"}
        />
        <StatCard
          title="Active Investigations"
          value={investigatingCount}
          description="Assigned to your queue"
          icon={Flame}
          highlightColor="blue"
        />
        <StatCard
          title="Unresolved Criticals"
          value={criticalCount}
          description="Highest triage priority"
          icon={AlertOctagon}
          highlightColor={criticalCount > 0 ? "red" : "teal"}
        />
        <StatCard
          title="Workload Capacity"
          value="2 / 6"
          description="Slots occupied (33% load)"
          icon={CheckCircle}
          highlightColor="teal"
        />
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {[
            { id: "ALL", label: `All (${incidents.length})` },
            { id: "PENDING_ACK", label: `Pending Ack (${pendingAckCount})` },
            { id: "INVESTIGATING", label: `Investigating (${investigatingCount})` },
            { id: "CONTAINED", label: "Contained" },
            { id: "RESOLVED", label: "Resolved" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filterTab === tab.id
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <Input
            placeholder="Filter queue by title or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-slate-900 border-slate-800"
          />
        </div>
      </div>

      {/* Incident Queue Table */}
      <Card className="border-slate-800 bg-slate-900/70 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Incident / Threat Category</th>
                <th className="py-3 px-4">Target Asset / User</th>
                <th className="py-3 px-4">Status & SLA</th>
                <th className="py-3 px-4">Detected</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No incidents found matching this queue filter.
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => {
                  const isPending = inc.status === "ASSIGNED";
                  return (
                    <tr
                      key={inc.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3 px-4 shrink-0">
                        <SeverityBadge severity={inc.severity} />
                      </td>

                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-semibold text-white group-hover:text-teal-300 transition-colors">
                          <Link href={`/technician/incidents/${inc.id}`}>
                            {inc.title}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <ThreatCategoryBadge category={inc.category} />
                          {inc.secondaryStatus && (
                            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              {inc.secondaryStatus}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {inc.affectedUser ? (
                          <div>
                            <div className="font-medium text-slate-200">
                              {inc.affectedUser.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {inc.affectedUser.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Perimeter Infrastructure</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={inc.status} />
                      </td>

                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(inc.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <Button
                              size="sm"
                              onClick={() => acknowledgeIncident(inc.id, inc.title)}
                              className="h-7 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
                            >
                              Acknowledge
                            </Button>
                          )}
                          <Link href={`/technician/incidents/${inc.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-slate-700 bg-slate-800 text-slate-200 hover:text-white"
                            >
                              <span>Investigate</span>
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
