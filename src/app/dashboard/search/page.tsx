"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  BookmarkCheck,
  Sparkles,
  ExternalLink,
  Info,
  ChevronRight,
  Terminal,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function SoftwareSearchPage() {
  const [query, setQuery] = useState<string>("lodash");
  const [ecosystem, setEcosystem] = useState<string>("npm");
  const [version, setVersion] = useState<string>("4.17.15");
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // AI Assistant Modal State
  const [selectedAdvisory, setSelectedAdvisory] = useState<any>(null);
  const [aiGuidance, setAiGuidance] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Catalog quick suggestions
  const suggestions = [
    { name: "Google Chrome", eco: "General", ver: "128.0.6613.84" },
    { name: "Mozilla Firefox", eco: "General", ver: "131.0.3" },
    { name: "lodash", eco: "npm", ver: "4.17.15" },
    { name: "requests", eco: "PyPI", ver: "2.20.0" },
    { name: "react", eco: "npm", ver: "18.2.0" },
    { name: "next", eco: "npm", ver: "13.5.6" },
    { name: "express", eco: "npm", ver: "4.17.1" },
  ];

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setSavedSuccess(false);

    try {
      const res = await fetch(
        `/api/vuln/check?name=${encodeURIComponent(query.trim())}&ecosystem=${encodeURIComponent(
          ecosystem
        )}&version=${encodeURIComponent(version.trim())}`
      );
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.details || errJson.error || "Upstream query failed");
      }
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Failed to query vulnerability source");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: query.trim(),
          ecosystem,
          currentVersion: version.trim() || "unknown",
          platform: ecosystem === "General" ? "Desktop" : "Development",
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
      }
    } catch {
      // ignore
    }
  };

  const handleOpenAiAssistant = async (finding: any) => {
    setSelectedAdvisory(finding);
    setAiLoading(true);
    setAiGuidance(null);

    try {
      const res = await fetch("/api/ai/fix-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advisoryId: finding.advisoryId,
          packageName: query.trim(),
          currentVersion: version.trim(),
          ecosystem,
          mode: ecosystem === "General" ? "PERSONAL" : "DEVELOPER",
        }),
      });
      const data = await res.json();
      setAiGuidance(data.guidance);
    } catch {
      // ignore
    } finally {
      setAiLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Software Vulnerability Checker
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform deterministic vulnerability lookups against live OSV.dev and CISA KEV intelligence.
        </p>
      </div>

      {/* Interactive Search Box */}
      <div className="bg-[#111C2E] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Package / Software Name */}
            <div className="sm:col-span-5 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Software / Package Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. lodash, Google Chrome, requests"
                  className="w-full bg-[#17243A] border border-slate-700 rounded-lg pl-9 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>

            {/* Ecosystem */}
            <div className="sm:col-span-3 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Ecosystem</label>
              <select
                value={ecosystem}
                onChange={(e) => setEcosystem(e.target.value)}
                className="w-full bg-[#17243A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
              >
                <option value="npm">npm (Node.js)</option>
                <option value="PyPI">PyPI (Python)</option>
                <option value="General">General (Desktop/OS)</option>
                <option value="crates.io">crates.io (Rust)</option>
                <option value="Go">Go (Golang)</option>
                <option value="Maven">Maven (Java)</option>
              </select>
            </div>

            {/* Installed Version */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Installed Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="4.17.15"
                className="w-full bg-[#17243A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2 flex items-end">
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs py-2 h-9 gap-1.5 shadow-sm shadow-teal-500/20"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Check Now
              </Button>
            </div>
          </div>

          {/* Quick Suggestions & "I don't know" toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Quick inspect:</span>
              <div className="flex flex-wrap gap-1">
                {suggestions.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => {
                      setQuery(s.name);
                      setEcosystem(s.eco);
                      setVersion(s.ver);
                    }}
                    className="px-2 py-0.5 rounded bg-[#17243A] border border-slate-700 hover:border-teal-400 text-slate-300 hover:text-white transition text-[11px]"
                  >
                    {s.name} ({s.ver})
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setVersion("unknown")}
              className="text-slate-400 hover:text-teal-300 text-[11px] underline"
            >
              I don&apos;t know my version
            </button>
          </div>
        </form>
      </div>

      {/* Upstream Error Notice (Scenario H) */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span>{error}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSearch()}
            className="border-red-500/30 text-red-300 hover:bg-red-500/20 text-xs"
          >
            Retry Query
          </Button>
        </div>
      )}

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Results Summary Header */}
          <div className="bg-[#111C2E] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">{results.query.name}</span>
                <span className="font-mono text-xs text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  v{results.query.version}
                </span>
                <Badge variant="outline" className="text-xs border-slate-700">
                  {results.query.ecosystem}
                </Badge>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Source: {results.source}</span>
                <span>&bull;</span>
                <span>{results.totalFindings} total advisories found</span>
              </div>
            </div>

            {/* Save to Watchlist Action */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleAddToWatchlist}
                disabled={savedSuccess}
                variant="outline"
                className={`text-xs gap-1.5 ${
                  savedSuccess
                    ? "border-teal-500 text-teal-300 bg-teal-500/10"
                    : "border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                {savedSuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Added to Watchlist
                  </>
                ) : (
                  <>
                    <BookmarkCheck className="h-3.5 w-3.5" /> Add to Watchlist
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#111C2E] rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Confirmed Applicable</div>
              <div className="text-xl font-bold text-red-400 mt-0.5">
                {results.summary.confirmedCount}
              </div>
            </div>
            <div className="p-3 bg-[#111C2E] rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Fix Urgently</div>
              <div className="text-xl font-bold text-amber-400 mt-0.5">
                {results.summary.urgentCount}
              </div>
            </div>
            <div className="p-3 bg-[#111C2E] rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Not Affected by Advisory</div>
              <div className="text-xl font-bold text-teal-400 mt-0.5">
                {results.summary.notAffectedCount}
              </div>
            </div>
            <div className="p-3 bg-[#111C2E] rounded-xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Needs Verification</div>
              <div className="text-xl font-bold text-slate-300 mt-0.5">
                {results.summary.needsVerificationCount}
              </div>
            </div>
          </div>

          {/* Findings List */}
          {results.findings.length === 0 ? (
            <div className="p-12 text-center bg-[#111C2E] rounded-2xl border border-slate-800 space-y-3">
              <CheckCircle2 className="h-10 w-10 text-teal-400 mx-auto" />
              <div className="text-base font-bold text-white">No known vulnerabilities reported</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No matching security advisories were reported in OSV.dev for {results.query.name} at version {results.query.version}. Note that new vulnerabilities may be discovered in the future; keep monitoring in your watchlist.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Vulnerability Findings ({results.findings.length})
              </h3>

              <div className="space-y-3">
                {results.findings.map((f: any) => (
                  <div
                    key={f.advisoryId}
                    className="p-5 rounded-xl bg-[#111C2E] border border-slate-800 hover:border-slate-700 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{f.advisoryId}</span>
                        {f.aliases?.map((a: string) => (
                          <span
                            key={a}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono"
                          >
                            {a}
                          </span>
                        ))}
                        {f.isKev && (
                          <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-[10px]">
                            CISA KEV (Actively Exploited)
                          </Badge>
                        )}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            f.priority === "FIX_URGENTLY"
                              ? "bg-red-500/20 text-red-300 border border-red-500/40"
                              : f.priority === "UPDATE_RECOMMENDED"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {f.priority.replace("_", " ")}
                        </span>
                      </div>

                      {/* Applicability Pill */}
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          f.applicability === "CONFIRMED_AFFECTED"
                            ? "bg-red-500/20 text-red-300"
                            : f.applicability === "NOT_AFFECTED"
                            ? "bg-teal-500/20 text-teal-300"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {f.applicability.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{f.summary}</p>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-[#17243A] p-3 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-slate-400 block">Severity / CVSS</span>
                        <span className="font-semibold text-white">
                          {f.severity} {f.cvssScore ? `(${f.cvssScore})` : ""}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">EPSS Probability</span>
                        <span className="font-semibold text-slate-200">
                          {f.epssScore ? `${(f.epssScore * 100).toFixed(1)}%` : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Affected Range</span>
                        <span className="font-mono text-slate-300 text-[10px] truncate block">
                          {f.affectedRange}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Recommended Fix</span>
                        <span className="font-semibold text-teal-400">
                          {f.recommendedFix || "Upgrade to latest"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <a
                        href={f.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-teal-300 flex items-center gap-1 transition"
                      >
                        Official Source Advisory <ExternalLink className="h-3 w-3" />
                      </a>

                      <Button
                        size="sm"
                        onClick={() => handleOpenAiAssistant(f)}
                        className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                        AI Fix Assistant
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Security Fix Assistant Modal */}
      <Dialog open={Boolean(selectedAdvisory)} onOpenChange={() => setSelectedAdvisory(null)}>
        <DialogContent className="max-w-2xl bg-[#111C2E] border-slate-800 text-slate-100 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-teal-400" />
              AI Security Fix Assistant
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Grounded remediation guidance for {selectedAdvisory?.advisoryId} affecting {query} (v{version})
            </DialogDescription>
          </DialogHeader>

          {aiLoading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="h-6 w-6 text-teal-400 animate-spin mx-auto" />
              <div className="text-xs text-slate-400">Formulating grounded fix recommendations...</div>
            </div>
          ) : aiGuidance ? (
            <div className="space-y-5 text-xs">
              {/* Overview */}
              <div className="p-3.5 rounded-xl bg-[#17243A] border border-slate-800 space-y-1">
                <div className="font-bold text-white text-sm">Vulnerability Summary</div>
                <p className="text-slate-300 leading-relaxed">{aiGuidance.overview}</p>
                <p className="text-amber-300 pt-1">{aiGuidance.riskExplanation}</p>
              </div>

              {/* Upgrade Commands (For Developers) */}
              {aiGuidance.upgradeCommands && aiGuidance.upgradeCommands.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-teal-400" />
                    Recommended Upgrade Command
                  </div>
                  {aiGuidance.upgradeCommands.map((cmd: string) => (
                    <div
                      key={cmd}
                      className="p-3 bg-[#0B1220] rounded-lg border border-slate-800 font-mono text-[11px] text-teal-300 flex items-center justify-between"
                    >
                      <span>{cmd}</span>
                      <button
                        onClick={() => copyToClipboard(cmd)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                      >
                        {copiedCmd === cmd ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Breaking Changes */}
              <div className="p-3 bg-[#17243A] rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-slate-400" />
                  Breaking Change Assessment
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`text-[10px] ${
                      aiGuidance.breakingChangeRisk === "HIGH"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-teal-500/20 text-teal-300"
                    }`}
                  >
                    Risk: {aiGuidance.breakingChangeRisk}
                  </Badge>
                  <span className="text-slate-300 text-[11px]">{aiGuidance.breakingChangeNotes}</span>
                </div>
              </div>

              {/* Step by Step Verification */}
              <div className="space-y-2">
                <div className="font-bold text-white">How to Verify This Fix:</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                  {aiGuidance.verificationSteps?.map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ol>
              </div>

              {/* Sources */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-3 text-[11px] text-slate-400">
                <span>Citations:</span>
                {aiGuidance.sourceCitations?.map((c: any) => (
                  <a
                    key={c.url}
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-400 hover:underline flex items-center gap-1"
                  >
                    {c.title} <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
