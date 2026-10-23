"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Send,
  MessageSquare,
  Sparkles,
  UserCheck,
  Info,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThreatCategoryBadge } from "@/components/shared/threat-category-badge";
import { IncidentTimeline } from "@/components/shared/timeline";

interface IncidentDetail {
  id: string;
  title: string;
  description: string;
  plainLanguageSummary: string;
  severity: string;
  status: string;
  secondaryStatus?: string | null;
  category: string;
  detectedAt: string;
  triagedAt?: string | null;
  acknowledgedAt?: string | null;
  containedAt?: string | null;
  resolvedAt?: string | null;
  assignments: Array<{
    id: string;
    technician: {
      specializations: string[];
      user: { name: string; email: string };
    };
  }>;
  timelineEvents: Array<{
    id: string;
    timestamp: string;
    actorName: string;
    action: string;
    description: string;
    statusFrom?: string | null;
    statusTo?: string | null;
    isVisibleToUser?: boolean;
  }>;
  messages: Array<{
    id: string;
    content: string;
    senderRole: string;
    createdAt: string;
    sender: { name: string };
  }>;
  resolution?: {
    summary: string;
    rootCause?: string;
    actionsTaken?: string;
    preventionSteps?: string;
    verifiedAt?: string;
  } | null;
}

export default function UserIncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <React.Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">Loading incident...</div>}>
      <UserIncidentDetailContent params={params} />
    </React.Suspense>
  );
}

function UserIncidentDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<any | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);

  const fetchIncident = () => {
    fetch(`/api/incidents/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.incident) setIncident(data.incident);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const loadAiExplanation = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch(`/api/incidents/${id}/ai-brief?view=user`);
      const data = await res.json();
      if (data.explanation) {
        setAiExplanation(data.explanation);
      }
    } catch {}
    setLoadingAi(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSendingMsg(true);
    try {
      const res = await fetch(`/api/incidents/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageText,
          senderRole: "USER",
        }),
      });
      if (res.ok) {
        setMessageText("");
        fetchIncident();
      }
    } catch {
      alert("Failed to send message");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleUserAction = async (response: "CONFIRMED_LEGITIMATE" | "CONFIRMED_SUSPICIOUS") => {
    try {
      const res = await fetch(`/api/incidents/${id}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      });
      if (res.ok) {
        setActionDone(
          response === "CONFIRMED_LEGITIMATE"
            ? "Confirmed as your activity. Case marked resolved safely."
            : "Unknown activity flagged. Incident escalated to senior technician."
        );
        fetchIncident();
      }
    } catch {
      alert("Error processing response");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading incident details...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Incident not found.
      </div>
    );
  }

  const assignedTech = incident.assignments?.[0]?.technician;
  const isAwaitingUser = incident.secondaryStatus === "AWAITING_USER" || (incident.category === "IDENTITY" && incident.status === "ASSIGNED");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
      {/* Back breadcrumb */}
      <div>
        <Link
          href="/dashboard"
          className="text-xs text-slate-400 hover:text-teal-300 font-medium inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Your Security Overview</span>
        </Link>
      </div>

      {actionDone && (
        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-sm flex items-center justify-between">
          <span>{actionDone}</span>
          <Button size="sm" variant="ghost" onClick={() => setActionDone(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Main Incident Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={incident.severity} useUserLabel={true} />
            <ThreatCategoryBadge category={incident.category} />
            <StatusBadge status={incident.status} useUserLabel={true} />
            {incident.secondaryStatus && (
              <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-500/30 bg-amber-500/10">
                {incident.secondaryStatus.replace("_", " ")}
              </Badge>
            )}
          </div>
          <span className="text-xs text-slate-400">
            Detected: {new Date(incident.detectedAt).toLocaleString()}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {incident.title}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            {incident.plainLanguageSummary}
          </p>
        </div>

        {/* Action Prompt if user confirmation needed */}
        {isAwaitingUser && (
          <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-amber-300">
                Did you perform this sign-in attempt?
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Confirming immediately helps your security team rule out unauthorized intrusions.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => handleUserAction("CONFIRMED_LEGITIMATE")}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
              >
                Yes, it was me
              </Button>
              <Button
                size="sm"
                onClick={() => handleUserAction("CONFIRMED_SUSPICIOUS")}
                className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-sm"
              >
                No, protect my account
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Timeline & AI Explanation */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Security Copilot Plain Language Explanation */}
          <Card className="border-teal-500/20 bg-slate-900/60">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <CardTitle className="text-base text-white">
                  AI Security Copilot (Plain Language)
                </CardTitle>
              </div>
              {!aiExplanation && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadAiExplanation}
                  disabled={loadingAi}
                  className="h-7 text-xs border-teal-500/30 text-teal-300 hover:bg-teal-500/10"
                >
                  {loadingAi ? "Analyzing..." : "Explain This Threat"}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {aiExplanation ? (
                <div className="space-y-3 text-xs leading-relaxed">
                  <p className="text-slate-300">{aiExplanation.plainExplanation}</p>
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="font-semibold text-slate-200">Recommended Precautions:</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                      {aiExplanation.recommendedSteps.map((s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2 text-[11px] text-teal-400/90 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Safe Guidance: {aiExplanation.safeActionGuidance}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  Need clarity on what this means without technical jargon? Tap &quot;Explain This Threat&quot; to receive a plain-language summary and safe next steps.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Interactive Incident Timeline */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-white">
                  Live Incident Timeline
                </CardTitle>
                <span className="text-xs text-slate-400">Real-time status</span>
              </div>
            </CardHeader>
            <CardContent>
              <IncidentTimeline events={incident.timelineEvents} isTechnicianView={false} />
            </CardContent>
          </Card>

          {/* Resolution verification if resolved */}
          {incident.resolution && (
            <Card className="border-emerald-500/30 bg-emerald-950/10">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <CardTitle className="text-base text-emerald-300">
                    Remediation Verified & Confirmed Safe
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p className="text-slate-200 leading-relaxed">{incident.resolution.summary}</p>
                {incident.resolution.actionsTaken && (
                  <p className="text-slate-400">
                    <strong>Actions Taken:</strong> {incident.resolution.actionsTaken}
                  </p>
                )}
                {incident.resolution.verifiedAt && (
                  <div className="pt-2 text-[11px] text-slate-500">
                    Verified on {new Date(incident.resolution.verifiedAt).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column (1 col): Assigned Technician & Secure Chat */}
        <div className="space-y-6">
          {/* Assigned Technician Profile */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-400" />
                Assigned Security Technician
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignedTech ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-teal-500/40">
                      <AvatarFallback className="bg-teal-500/10 text-teal-300 font-semibold">
                        {assignedTech.user.name.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-white">
                          {assignedTech.user.name}
                        </span>
                        <Badge variant="outline" className="text-[9px] py-0 px-1.5 text-teal-300 border-teal-500/40 bg-teal-500/10">
                          Verified Specialist
                        </Badge>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {assignedTech.user.email}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-[11px] font-medium text-slate-300 block mb-1">
                      Certified Specializations:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {assignedTech.specializations.map((s: string) => (
                        <span key={s} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  Routing engine is currently assigning the optimal specialist...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Secure Incident Support Messaging */}
          <Card className="border-slate-800 bg-slate-900/60 flex flex-col h-[400px]">
            <CardHeader className="pb-2 border-b border-slate-800/80 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-teal-400" />
                  Verified Incident Support
                </CardTitle>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-teal-400" /> End-to-End Logged
                </span>
              </div>
            </CardHeader>

            <div className="p-2 bg-slate-950/80 border-b border-slate-800/60 text-[10px] text-slate-400 text-center shrink-0">
              For your safety, technicians will never ask for passwords or MFA tokens.
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
              {incident.messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-xs text-slate-500">
                  Have a question about this incident? Send a message directly to your assigned technician.
                </div>
              ) : (
                incident.messages.map((m) => {
                  const isUser = m.senderRole === "USER";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                        <span className="font-medium text-slate-300">{m.sender.name}</span>
                        {!isUser && (
                          <span className="text-[9px] text-teal-400 bg-teal-500/10 px-1 rounded">
                            Technician
                          </span>
                        )}
                        <span>· {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`rounded-xl px-3 py-2 text-xs max-w-[85%] leading-relaxed ${
                          isUser
                            ? "bg-teal-500/20 text-teal-100 border border-teal-500/30"
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
            <form onSubmit={sendMessage} className="p-3 border-t border-slate-800/80 flex gap-2 shrink-0">
              <Input
                placeholder="Ask your technician a question..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="text-xs h-9 bg-slate-950"
              />
              <Button
                type="submit"
                size="sm"
                disabled={sendingMsg || !messageText.trim()}
                className="h-9 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
