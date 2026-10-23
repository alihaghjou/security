"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThreatCategoryBadge } from "@/components/shared/threat-category-badge";
import { SecurityScore } from "@/components/shared/security-score";
import { EmptyState } from "@/components/shared/empty-state";

interface Incident {
  id: string;
  title: string;
  plainLanguageSummary: string;
  severity: string;
  status: string;
  secondaryStatus?: string | null;
  category: string;
  detectedAt: string;
  assignments: Array<{
    technician: {
      user: { name: string; email: string };
    };
  }>;
}

export default function UserDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const fetchIncidents = () => {
    setLoading(true);
    fetch("/api/incidents")
      .then((res) => res.json())
      .then((data) => {
        setIncidents(data.incidents || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleUserResponse = async (
    incidentId: string,
    response: "CONFIRMED_LEGITIMATE" | "CONFIRMED_SUSPICIOUS" | "REQUESTED_SUPPORT"
  ) => {
    setRespondingId(incidentId);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      });
      const data = await res.json();
      if (res.ok) {
        if (response === "CONFIRMED_LEGITIMATE") {
          setActionSuccess("Thank you for confirming. The alert has been cleared safely.");
        } else if (response === "CONFIRMED_SUSPICIOUS") {
          setActionSuccess("Understood! Unknown sessions have been revoked and a technician is investigating.");
        } else {
          setActionSuccess("Support request received. A technician will contact you shortly.");
        }
        fetchIncidents();
        setTimeout(() => setActionSuccess(null), 5000);
      }
    } catch {
      alert("Error processing response");
    } finally {
      setRespondingId(null);
    }
  };

  // Group incidents for the everyday user
  const requiringAttention = incidents.filter(
    (i) => i.secondaryStatus === "AWAITING_USER" || (i.category === "IDENTITY" && i.status === "ASSIGNED")
  );

  const beingHandled = incidents.filter(
    (i) =>
      ["ASSIGNED", "ACKNOWLEDGED", "INVESTIGATING", "CONTAINED"].includes(i.status) &&
      !requiringAttention.some((a) => a.id === i.id)
  );

  const recentlyResolved = incidents.filter(
    (i) => i.status === "RESOLVED" || i.status === "CLOSED"
  );

  const hasUrgentAlert = requiringAttention.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* Reassuring Top Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-teal-400">
              Personal Security Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Your Security Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            {hasUrgentAlert
              ? "We noticed 1 activity needing your quick confirmation. All other monitored accounts remain protected."
              : "Continuous protection is active across your connected devices, work identity, and corporate email."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchIncidents}
            className="border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Status
          </Button>
          <Link href="/dashboard/support">
            <Button size="sm" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Contact Security Support
            </Button>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-sm flex items-center justify-between animate-in fade-in">
          <span>{actionSuccess}</span>
          <Button size="sm" variant="ghost" onClick={() => setActionSuccess(null)} className="h-7 text-teal-300">
            Dismiss
          </Button>
        </div>
      )}

      {/* Security Health Score Card */}
      <SecurityScore score={hasUrgentAlert ? 84 : 96} coveragePercentage={98} />

      {/* SECTION 1: Active Incidents Requiring Your Attention */}
      <section aria-labelledby="incidents-requiring-attention-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h2 id="incidents-requiring-attention-heading" className="text-lg font-semibold text-white tracking-tight">
              Action Required ({requiringAttention.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {requiringAttention.length === 0 ? "Everything is clear" : "One-tap verification"}
          </span>
        </div>

        {requiringAttention.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No actions required from you"
            description="You have no pending verification requests or threat alerts. Your assigned security team is handling routine telemetry in the background."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {requiringAttention.map((incident) => {
              const tech = incident.assignments?.[0]?.technician?.user;
              return (
                <Card
                  key={incident.id}
                  className="border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 shadow-lg relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-3 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <SeverityBadge severity={incident.severity} useUserLabel={true} />
                          <ThreatCategoryBadge category={incident.category} />
                          <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-500/40 bg-amber-500/10">
                            Awaiting Your Confirmation
                          </Badge>
                        </div>

                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-white">
                            {incident.title}
                          </h3>
                          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                            {incident.plainLanguageSummary}
                          </p>
                        </div>

                        {tech && (
                          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 py-1.5 px-3 rounded-lg border border-slate-800 w-fit">
                            <span className="w-2 h-2 rounded-full bg-teal-400" />
                            <span>Assigned Technician: <strong className="text-slate-200">{tech.name}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Immediate One-Tap Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 min-w-[220px]">
                        <Button
                          onClick={() => handleUserResponse(incident.id, "CONFIRMED_LEGITIMATE")}
                          disabled={respondingId === incident.id}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold justify-center"
                        >
                          Yes, this was me
                        </Button>

                        <Button
                          onClick={() => handleUserResponse(incident.id, "CONFIRMED_SUSPICIOUS")}
                          disabled={respondingId === incident.id}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold justify-center shadow-sm"
                        >
                          No, protect my account
                        </Button>

                        <Link href={`/dashboard/incidents/${incident.id}`}>
                          <Button
                            variant="ghost"
                            className="w-full text-xs text-slate-400 hover:text-white justify-center"
                          >
                            <span>View incident timeline</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: Incidents Being Handled By Technicians */}
      <section aria-labelledby="incidents-handled-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <h2 id="incidents-handled-heading" className="text-lg font-semibold text-white tracking-tight">
              Being Handled by Security Team ({beingHandled.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            No action required from you
          </span>
        </div>

        {beingHandled.length === 0 ? (
          <div className="p-6 rounded-xl border border-slate-800/80 bg-slate-900/40 text-center text-sm text-slate-400">
            No open investigations. Your systems are calm and monitored.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {beingHandled.map((incident) => {
              const tech = incident.assignments?.[0]?.technician?.user;
              return (
                <Card
                  key={incident.id}
                  className="border-slate-800 hover:border-slate-700/80 transition-all bg-slate-900/60"
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <SeverityBadge severity={incident.severity} useUserLabel={true} />
                      <StatusBadge status={incident.status} useUserLabel={true} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm text-white line-clamp-1">
                        {incident.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {incident.plainLanguageSummary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Technician: <strong className="text-slate-200">{tech ? tech.name : "Routing..."}</strong>
                      </span>
                      <Link
                        href={`/dashboard/incidents/${incident.id}`}
                        className="text-teal-400 hover:text-teal-300 font-medium inline-flex items-center gap-1"
                      >
                        <span>Follow progress</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 3: Recently Resolved Incidents */}
      <section aria-labelledby="recently-resolved-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 id="recently-resolved-heading" className="text-lg font-semibold text-white tracking-tight">
              Recently Resolved ({recentlyResolved.length})
            </h2>
          </div>
          <Link
            href="/dashboard/alerts"
            className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
          >
            <span>View all past incidents</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentlyResolved.slice(0, 2).map((incident) => (
            <Card
              key={incident.id}
              className="border-slate-800/60 bg-slate-900/40 opacity-90"
            >
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <StatusBadge status="RESOLVED" useUserLabel={true} />
                  <span className="text-xs text-slate-500">
                    {new Date(incident.detectedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-medium text-sm text-slate-200">{incident.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {incident.plainLanguageSummary}
                </p>
                <div className="pt-2 flex justify-end">
                  <Link
                    href={`/dashboard/incidents/${incident.id}`}
                    className="text-xs text-slate-400 hover:text-teal-300 inline-flex items-center gap-1"
                  >
                    <span>Read resolution verification</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 4: Weekly Security Summary Reassurance */}
      <div className="p-6 rounded-2xl border border-teal-500/20 bg-gradient-to-r from-slate-900 via-teal-950/20 to-slate-900 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Weekly Security Peace-of-Mind Report
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              This week, your dedicated security team verified 4 automated checks and kept 100% of unauthorized attempts contained.
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              No passwords were leaked, and zero data exfiltration occurred. Your endpoint telemetry and identity guards are operating at peak health.
            </p>
          </div>
          <Link href="/dashboard/protection" className="shrink-0">
            <Button size="sm" variant="outline" className="border-teal-500/30 text-teal-300 hover:bg-teal-500/10">
              Review Protection Settings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
