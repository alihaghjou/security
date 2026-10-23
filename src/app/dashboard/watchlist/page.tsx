"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookmarkCheck,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  History,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // "I updated this software" verification modal
  const [verifyingEntry, setVerifyingEntry] = useState<any>(null);
  const [newVersionInput, setNewVersionInput] = useState<string>("");
  const [verifyingLoading, setVerifyingLoading] = useState<boolean>(false);
  const [verificationFeedback, setVerificationFeedback] = useState<any>(null);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/watchlist");
      const data = await res.json();
      setWatchlist(data.watchlist || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to stop monitoring this software?")) return;
    try {
      await fetch(`/api/watchlist?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setWatchlist((prev) => prev.filter((item) => item.id !== id));
    } catch {
      // ignore
    }
  };

  const openVerifyDialog = (entry: any) => {
    setVerifyingEntry(entry);
    setNewVersionInput("");
    setVerificationFeedback(null);
  };

  const handleExecuteVerification = async () => {
    if (!verifyingEntry || !newVersionInput.trim()) return;

    setVerifyingLoading(true);
    setVerificationFeedback(null);

    try {
      const res = await fetch(`/api/watchlist/${verifyingEntry.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newVersion: newVersionInput.trim() }),
      });
      const data = await res.json();
      setVerificationFeedback(data.verification);
      fetchWatchlist(); // refresh watchlist data in background
    } catch (err: any) {
      setVerificationFeedback({
        results: [
          {
            outcome: "UNABLE_TO_VERIFY",
            notes: err.message || "Failed to execute verification check",
          },
        ],
      });
    } finally {
      setVerifyingLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BookmarkCheck className="h-6 w-6 text-teal-400" />
            Software Watchlist
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Continuous vulnerability tracking for your desktop apps, browsers, and frameworks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={fetchWatchlist}
            variant="outline"
            size="sm"
            disabled={loading}
            className="border-slate-800 text-slate-300 hover:text-white bg-[#111C2E] gap-2 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-teal-400" : ""}`} />
            Recheck All
          </Button>
          <Link href="/dashboard/search">
            <Button size="sm" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Software
            </Button>
          </Link>
        </div>
      </div>

      {/* Watchlist Table / Cards */}
      {loading ? (
        <div className="p-16 text-center bg-[#111C2E] rounded-2xl border border-slate-800 text-xs text-slate-400 animate-pulse">
          Loading monitored software records and verified findings...
        </div>
      ) : watchlist.length === 0 ? (
        <div className="p-12 text-center bg-[#111C2E] rounded-2xl border border-slate-800 space-y-4">
          <BookmarkCheck className="h-10 w-10 text-slate-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Your watchlist is currently empty</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Add your desktop applications, browsers, or developer dependencies to receive continuous monitoring.
            </p>
          </div>
          <Link href="/dashboard/search">
            <Button size="sm" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs">
              Search & Track Software
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {watchlist.map((item) => {
            const confirmed = (item.findings || []).filter((f: any) => f.status === "CONFIRMED_AFFECTED");
            const resolved = (item.findings || []).filter((f: any) => f.status === "VERIFIED_FIXED");
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-[#111C2E] border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition"
              >
                {/* Main Card Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-white text-base">{item.name}</span>
                      <span className="font-mono text-xs text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                        v{item.currentVersion}
                      </span>
                      <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">
                        {item.ecosystem}
                      </Badge>
                      <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-800/80">
                        {item.platform || "Desktop"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        Checked {new Date(item.lastCheckedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span>&bull;</span>
                      <span>
                        {confirmed.length > 0 ? (
                          <span className="text-amber-400 font-semibold">
                            {confirmed.length} active {confirmed.length === 1 ? "vulnerability" : "vulnerabilities"}
                          </span>
                        ) : (
                          <span className="text-teal-400 font-medium">No active vulnerabilities</span>
                        )}
                      </span>
                      {resolved.length > 0 && (
                        <>
                          <span>&bull;</span>
                          <span className="text-teal-300">{resolved.length} resolved</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* "I updated this software" Action */}
                    <Button
                      size="sm"
                      onClick={() => openVerifyDialog(item)}
                      className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs gap-1.5 shadow-sm shadow-teal-500/20"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      I updated this software
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="text-xs text-slate-300 hover:text-white border border-slate-800 gap-1"
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      {isExpanded ? "Hide Details" : "View Details"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-2"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Details & Verification Audit Log */}
                {isExpanded && (
                  <div className="border-t border-slate-800 bg-[#0B1220]/70 p-5 space-y-4">
                    {/* Active Findings */}
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                        Active Vulnerability Findings ({item.findings?.length || 0})
                      </h4>

                      {item.findings && item.findings.length > 0 ? (
                        <div className="space-y-2">
                          {item.findings.map((f: any) => (
                            <div
                              key={f.id}
                              className="p-3 bg-[#111C2E] rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">{f.advisoryId}</span>
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                      f.status === "VERIFIED_FIXED"
                                        ? "bg-teal-500/20 text-teal-300"
                                        : f.priority === "FIX_URGENTLY"
                                        ? "bg-red-500/20 text-red-300"
                                        : "bg-amber-500/20 text-amber-300"
                                    }`}
                                  >
                                    {f.status.replace("_", " ")}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    Severity: {f.severity}
                                  </span>
                                </div>
                                <p className="text-slate-300 text-[11px] mt-1">{f.summary}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[11px] text-teal-400 font-medium block">
                                  Fix: {f.fixedVersion || "Latest patch"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 p-3 bg-[#111C2E] rounded-lg">
                          No active vulnerability advisories recorded.
                        </div>
                      )}
                    </div>

                    {/* Verification Audit Log (Requirement 12) */}
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <History className="h-3.5 w-3.5 text-teal-400" />
                        Fix Verification Audit Trail ({item.verifications?.length || 0})
                      </h4>

                      {item.verifications && item.verifications.length > 0 ? (
                        <div className="space-y-2">
                          {item.verifications.map((v: any) => (
                            <div
                              key={v.id}
                              className="p-3 bg-[#111C2E] rounded-xl border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                      v.outcome === "FIXED_CONFIRMED"
                                        ? "bg-teal-500/20 text-teal-300"
                                        : v.outcome === "STILL_AFFECTED"
                                        ? "bg-red-500/20 text-red-300"
                                        : "bg-slate-800 text-slate-300"
                                    }`}
                                  >
                                    {v.outcome.replace("_", " ")}
                                  </span>
                                  <span className="text-slate-300">
                                    v{v.previousVersion} &rarr;{" "}
                                    <span className="font-semibold text-white">v{v.newVersion}</span>
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400">{v.notes}</p>
                              </div>
                              <div className="text-[10px] text-slate-500 whitespace-nowrap">
                                {new Date(v.verifiedAt).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic p-3 bg-[#111C2E] rounded-lg">
                          No version updates recorded yet. When you update this application, click &quot;I updated this software&quot; to test your fix.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Verification Modal Dialog */}
      <Dialog open={Boolean(verifyingEntry)} onOpenChange={() => setVerifyingEntry(null)}>
        <DialogContent className="max-w-md bg-[#111C2E] border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <CheckCircle2 className="h-5 w-5 text-teal-400" />
              Verify Software Update
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Confirm whether your new version of {verifyingEntry?.name} resolves active vulnerabilities.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="bg-[#17243A] p-3 rounded-lg border border-slate-800 text-xs space-y-1">
              <div className="text-slate-400">Currently recorded version:</div>
              <div className="font-mono text-sm font-semibold text-white">
                v{verifyingEntry?.currentVersion}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                What version did you install?
              </label>
              <input
                type="text"
                value={newVersionInput}
                onChange={(e) => setNewVersionInput(e.target.value)}
                placeholder="e.g. 4.17.21 or 131.0.6778.85"
                className="w-full bg-[#17243A] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-400"
              />
            </div>

            {verificationFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  verificationFeedback.results?.[0]?.outcome === "FIXED_CONFIRMED"
                    ? "bg-teal-500/10 border-teal-500/40 text-teal-300"
                    : "bg-red-500/10 border-red-500/40 text-red-300"
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {verificationFeedback.results?.[0]?.outcome === "FIXED_CONFIRMED" ? (
                    <>
                      <Check className="h-4 w-4" /> Fixed Version Confirmed!
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4" /> Version Verification Result
                    </>
                  )}
                </div>
                <div className="text-[11px] leading-relaxed">
                  {verificationFeedback.results?.[0]?.notes}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVerifyingEntry(null)}
                className="text-xs text-slate-400"
              >
                {verificationFeedback ? "Close" : "Cancel"}
              </Button>
              <Button
                size="sm"
                disabled={verifyingLoading || !newVersionInput.trim()}
                onClick={handleExecuteVerification}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs gap-1.5"
              >
                {verifyingLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5" />
                )}
                Run Verification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
