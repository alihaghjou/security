"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThreatCategoryBadge } from "@/components/shared/threat-category-badge";
import { EmptyState } from "@/components/shared/empty-state";

export default function UserAlertsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

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
      inc.plainLanguageSummary.toLowerCase().includes(search.toLowerCase()) ||
      inc.category.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity =
      filterSeverity === "ALL" || inc.severity === filterSeverity;

    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "ACTIVE" && !["RESOLVED", "CLOSED"].includes(inc.status)) ||
      (filterStatus === "RESOLVED" && ["RESOLVED", "CLOSED"].includes(inc.status));

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Security Alerts & Events
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete transparent stream of security events flagged on your account.
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by title, threat category, or device..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-xs bg-slate-900 border-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 text-xs rounded-lg bg-slate-900 border border-slate-800 px-3 text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Cases</option>
            <option value="RESOLVED">Resolved Cases</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="h-10 text-xs rounded-lg bg-slate-900 border border-slate-800 px-3 text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Incidents Stream List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No alerts matching criteria"
          description="Everything in this view is calm and safe. Try clearing filters if you are looking for past records."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((inc) => {
            const tech = inc.assignments?.[0]?.technician?.user;
            return (
              <Card
                key={inc.id}
                className="border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/90 transition-all hover:border-slate-700/80"
              >
                <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={inc.severity} useUserLabel={true} />
                      <ThreatCategoryBadge category={inc.category} />
                      <StatusBadge status={inc.status} useUserLabel={true} />
                      <span className="text-xs text-slate-500">
                        {new Date(inc.detectedAt).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="font-semibold text-base text-white">
                      {inc.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {inc.plainLanguageSummary}
                    </p>

                    {tech && (
                      <div className="text-xs text-slate-400">
                        Assigned Specialist: <span className="text-slate-200 font-medium">{tech.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center">
                    <Link href={`/dashboard/incidents/${inc.id}`}>
                      <Button size="sm" variant="outline" className="border-slate-700 bg-slate-800/80 text-xs text-slate-200 hover:text-white">
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
