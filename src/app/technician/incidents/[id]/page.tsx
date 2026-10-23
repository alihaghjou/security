"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Wrench,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Search,
  Send,
  Sparkles,
  FileText,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  ChevronRight,
  Database,
  Layers,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThreatCategoryBadge } from "@/components/shared/threat-category-badge";
import { IncidentTimeline } from "@/components/shared/timeline";

export default function TechnicianInvestigationWorkspace({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <React.Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">Loading workspace...</div>}>
      <TechnicianInvestigationContent params={params} />
    </React.Suspense>
  );
}

function TechnicianInvestigationContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [incident, setIncident] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiBrief, setAiBrief] = useState<any | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [statusActionLoading, setStatusActionLoading] = useState(false);
  const [userMsg, setUserMsg] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Resolution Form State
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [actionsTaken, setActionsTaken] = useState("");
  const [preventionSteps, setPreventionSteps] = useState("");

  const fetchIncident = () => {
    fetch(`/api/incidents/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.incident) {
          setIncident(data.incident);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const loadAiBrief = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch(`/api/incidents/${id}/ai-brief?view=technician`);
      const data = await res.json();
      if (data.brief) {
        setAiBrief(data.brief);
        if (!resolutionSummary && data.brief.draftResolutionSummary) {
          setResolutionSummary(data.brief.draftResolutionSummary);
        }
      }
    } catch {}
    setLoadingAi(false);
  };

  const updateStatus = async (
    newStatus: string,
    notes?: string,
    resolutionData?: any
  ) => {
    setStatusActionLoading(true);
    try {
      const payload: any = {
        status: newStatus,
        actorName: "Alex Chen (SOC L2)",
        notes: notes || `Technician transitioned status to ${newStatus}.`,
      };
      if (resolutionData) {
        payload.resolution = resolutionData;
      }
      const res = await fetch(`/api/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setActionNotice(`Status updated to ${newStatus}`);
        fetchIncident();
        setShowResolveModal(false);
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch {
      alert("Failed to update status");
    } finally {
      setStatusActionLoading(false);
    }
  };

  const sendUserMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMsg.trim()) return;
    setSendingMsg(true);
    try {
      const res = await fetch(`/api/incidents/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: userMsg,
          senderRole: "TECHNICIAN",
        }),
      });
      if (res.ok) {
        setUserMsg("");
        fetchIncident();
      }
    } catch {
      alert("Failed to send message");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionSummary.trim()) {
      alert("Please enter a resolution summary");
      return;
    }
    updateStatus("RESOLVED", "Verified resolution documented by technician.", {
      summary: resolutionSummary,
      rootCause,
      actionsTaken,
      preventionSteps,
    });
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">Loading workspace...</div>;
  }

  if (!incident) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">Incident not found.</div>;
  }

  const isAssigned = incident.status === "ASSIGNED";
  const isInvestigating = incident.status === "INVESTIGATING" || incident.status === "ACKNOWLEDGED";
  const isContained = incident.status === "CONTAINED";
  const isResolved = incident.status === "RESOLVED" || incident.status === "CLOSED";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
      {/* Breadcrumb & Quick Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/technician"
          className="text-xs text-slate-400 hover:text-amber-300 font-medium inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assigned Queue</span>
        </Link>

        {/* Workflow Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {isAssigned && (
            <Button
              size="sm"
              onClick={() => updateStatus("ACKNOWLEDGED", "Technician acknowledged case.")}
              disabled={statusActionLoading}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Acknowledge Case
            </Button>
          )}

          {incident.status === "ACKNOWLEDGED" && (
            <Button
              size="sm"
              onClick={() => updateStatus("INVESTIGATING", "Commenced forensic analysis.")}
              disabled={statusActionLoading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
            >
              <Search className="w-3.5 h-3.5 mr-1" />
              Start Investigation
            </Button>
          )}

          {isInvestigating && (
            <Button
              size="sm"
              onClick={() => updateStatus("CONTAINED", "Isolated affected host and blocked perimeter traffic.")}
              disabled={statusActionLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
            >
              <Lock className="w-3.5 h-3.5 mr-1" />
              Mark Contained
            </Button>
          )}

          {(isInvestigating || isContained) && (
            <Button
              size="sm"
              onClick={() => setShowResolveModal(true)}
              disabled={statusActionLoading}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Document Resolution
            </Button>
          )}

          {isResolved && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatus("REOPENED", "Reopened for additional telemetry review.")}
              disabled={statusActionLoading}
              className="border-rose-500/40 text-rose-300 hover:bg-rose-500/10 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reopen Case
            </Button>
          )}
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Primary Incident Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={incident.severity} />
            <ThreatCategoryBadge category={incident.category} />
            <StatusBadge status={incident.status} />
            {incident.secondaryStatus && (
              <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/40 bg-amber-500/10">
                {incident.secondaryStatus}
              </Badge>
            )}
            <span className="text-xs text-slate-400 ml-2">Case ID: {incident.id.slice(0, 12)}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Detected: <strong>{new Date(incident.detectedAt).toLocaleString()}</strong></span>
            {incident.acknowledgedAt && (
              <span>Ack: <strong>{new Date(incident.acknowledgedAt).toLocaleTimeString()}</strong></span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {incident.title}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
              {incident.description}
            </p>
          </div>

          <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-slate-200 block text-xs border-b border-slate-800 pb-1">
              Case Ownership & Target
            </span>
            <div className="flex justify-between">
              <span>Affected User:</span>
              <strong className="text-slate-200">
                {incident.affectedUser?.name || "Infrastructure"}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>User Email:</span>
              <span className="text-teal-400 font-mono text-[11px]">
                {incident.affectedUser?.email || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Organization:</span>
              <span className="text-slate-200">Acme Corporation</span>
            </div>
            <div className="flex justify-between">
              <span>Correlated Events:</span>
              <span className="text-amber-400 font-semibold">{incident.securityEvents.length} telemetry signals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Evidence, AI Brief, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Security Copilot Technician Brief */}
          <Card className="border-amber-500/20 bg-slate-900/60">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <CardTitle className="text-base text-white">
                  AI SOC Assistant (Investigation Brief)
                </CardTitle>
              </div>
              {!aiBrief && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadAiBrief}
                  disabled={loadingAi}
                  className="h-7 text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                >
                  {loadingAi ? "Synthesizing Telemetry..." : "Generate SOC Brief"}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {aiBrief ? (
                <div className="space-y-4 text-xs leading-relaxed">
                  <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-200 font-medium">
                    Suggested Standard Runbook: {aiBrief.suggestedRunbook}
                  </div>

                  <div>
                    <span className="font-semibold text-slate-200 block mb-1">
                      Evidence Synthesis:
                    </span>
                    <p className="text-slate-300">{aiBrief.evidenceSummary}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-200 block mb-1">
                      Recommended Investigation Checklist:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300 font-mono text-[11px]">
                      {aiBrief.suggestedInvestigationSteps.map((step: string, i: number) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 italic">
                    {aiBrief.disclaimer}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Tap &quot;Generate SOC Brief&quot; to inspect recommended investigation runbook steps, evidence summaries, and draft user communications grounded in incident data.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Raw Telemetry & Security Evidence */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-teal-400" />
                  Security Telemetry & Correlated Evidence ({incident.securityEvents.length})
                </CardTitle>
                <Badge variant="outline" className="text-xs text-slate-400">
                  Raw Ingestion Preserved
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {incident.securityEvents.map((ev: any, index: number) => (
                <div
                  key={ev.id || index}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5"
                >
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="text-teal-400 font-semibold">{ev.normalizedTitle}</span>
                    <span>{new Date(ev.receivedAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">{ev.normalizedDescription}</div>
                  <div className="flex flex-wrap gap-3 pt-1 text-[10px] text-slate-500">
                    {ev.sourceIp && <span>Source IP: <strong className="text-slate-300">{ev.sourceIp}</strong></span>}
                    {ev.targetAsset && <span>Target Asset: <strong className="text-slate-300">{ev.targetAsset}</strong></span>}
                    <span>Source: {ev.source}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Detailed Technical Timeline */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">
                Technical Audit & Investigation Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IncidentTimeline events={incident.timelineEvents} isTechnicianView={true} />
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: User Messaging & Containment Actions */}
        <div className="space-y-6">
          {/* User Contact & Secure Incident Messenger */}
          <Card className="border-slate-800 bg-slate-900/60 flex flex-col h-[480px]">
            <CardHeader className="pb-2 border-b border-slate-800/80 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-200 flex items-center gap-1.5">
                  Secure Communication with User
                </CardTitle>
                <span className="text-[10px] text-slate-400">Audited Chat</span>
              </div>
            </CardHeader>

            <div className="p-2 bg-slate-950 text-[10px] text-slate-400 text-center shrink-0 border-b border-slate-800/60">
              Direct incident communication with {incident.affectedUser?.name || "User"}.
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
              {incident.messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-xs text-slate-500">
                  No messages exchanged yet. Use this channel to request clarifications or provide reassurance.
                </div>
              ) : (
                incident.messages.map((m: any) => {
                  const isTech = m.senderRole === "TECHNICIAN";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isTech ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                        <span className="font-medium text-slate-300">{m.sender.name}</span>
                        <span>· {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`rounded-xl px-3 py-2 text-xs max-w-[85%] leading-relaxed ${
                          isTech
                            ? "bg-amber-500/20 text-amber-100 border border-amber-500/30"
                            : "bg-slate-800 text-slate-200 border border-slate-700/80"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message input */}
            <form onSubmit={sendUserMessage} className="p-3 border-t border-slate-800/80 flex gap-2 shrink-0">
              <Input
                placeholder="Send secure note or question to user..."
                value={userMsg}
                onChange={(e) => setUserMsg(e.target.value)}
                className="text-xs h-9 bg-slate-950"
              />
              <Button
                type="submit"
                size="sm"
                disabled={sendingMsg || !userMsg.trim()}
                className="h-9 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Resolution Documentation Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-400" />
                Document Verifiable Incident Resolution
              </h2>
              <button
                onClick={() => setShowResolveModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Resolution Summary (Plain language for user & audit log)*
                </label>
                <Textarea
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  placeholder="Summarize the remediation and state why the threat is now neutralized..."
                  className="bg-slate-950 text-xs min-h-[70px]"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Root Cause Analysis
                </label>
                <Input
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="e.g. Credential stuffing via compromised third-party list"
                  className="bg-slate-950 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Remediation Actions Taken
                </label>
                <Input
                  value={actionsTaken}
                  onChange={(e) => setActionsTaken(e.target.value)}
                  placeholder="e.g. Revoked OAuth tokens, quarantined payload, updated firewall rule"
                  className="bg-slate-950 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Recommended Preventive Steps
                </label>
                <Input
                  value={preventionSteps}
                  onChange={(e) => setPreventionSteps(e.target.value)}
                  placeholder="e.g. Enforce hardware FIDO2 key rollout"
                  className="bg-slate-950 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowResolveModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={statusActionLoading}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs"
                >
                  Verify & Resolve Incident
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
