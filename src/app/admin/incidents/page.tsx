"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThreatCategoryBadge } from "@/components/shared/threat-category-badge";

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

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

  const filtered = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.category.toLowerCase().includes(search.toLowerCase()) ||
      (inc.affectedUser?.name || "").toLowerCase().includes(search.toLowerCase());

    const matchesSeverity =
      severityFilter === "ALL" || inc.severity === severityFilter;

    const matchesStatus =
      statusFilter === "ALL" || inc.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Organization Incident Master Record
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete auditable ledger of all security events, investigations, and verified resolutions.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchIncidents}
          className="border-slate-800 bg-slate-900 text-slate-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search all cases by title, target user, or threat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs bg-slate-900 border-slate-800 h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-9 text-xs rounded-lg bg-slate-900 border border-slate-800 px-3 text-slate-300"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 text-xs rounded-lg bg-slate-900 border border-slate-800 px-3 text-slate-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="DETECTED">Detected</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="CONTAINED">Contained</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Master Incident Table */}
      <Card className="border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Title & Category</th>
                <th className="py-3 px-4">Affected User / Target</th>
                <th className="py-3 px-4">Assigned Tech</th>
                <th className="py-3 px-4">Lifecycle Status</th>
                <th className="py-3 px-4">Detected At</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filtered.map((inc) => {
                const tech = inc.assignments?.[0]?.technician?.user;
                return (
                  <tr key={inc.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <SeverityBadge severity={inc.severity} />
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-white truncate">{inc.title}</div>
                      <div className="mt-1">
                        <ThreatCategoryBadge category={inc.category} />
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      {inc.affectedUser ? (
                        <div>
                          <div>{inc.affectedUser.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{inc.affectedUser.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Perimeter Asset</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-200">
                      {tech ? tech.name : <span className="text-slate-500">Unassigned</span>}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={inc.status} />
                    </td>

                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(inc.detectedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link href={`/technician/incidents/${inc.id}`}>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-purple-300 hover:text-white">
                          Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
