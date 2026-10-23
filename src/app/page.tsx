"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Laptop,
  Code2,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function WelcomeOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [mode, setMode] = useState<"PERSONAL" | "DEVELOPER">("PERSONAL");
  const [softwareName, setSoftwareName] = useState<string>("Google Chrome");
  const [ecosystem, setEcosystem] = useState<string>("General");
  const [version, setVersion] = useState<string>("128.0.6613.84");
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkProgressText, setCheckProgressText] = useState<string>("Identifying software...");
  const [checkResults, setCheckResults] = useState<any>(null);
  const [savedToWatchlist, setSavedToWatchlist] = useState<boolean>(false);

  // Suggestions for Screen 3
  const personalSuggestions = [
    { name: "Google Chrome", ecosystem: "General", version: "128.0.6613.84" },
    { name: "Mozilla Firefox", ecosystem: "General", version: "131.0.3" },
    { name: "Node.js", ecosystem: "General", version: "20.18.1" },
    { name: "Python", ecosystem: "General", version: "3.12.7" },
  ];

  const developerSuggestions = [
    { name: "lodash", ecosystem: "npm", version: "4.17.15" },
    { name: "requests", ecosystem: "PyPI", version: "2.20.0" },
    { name: "react", ecosystem: "npm", version: "18.2.0" },
    { name: "next", ecosystem: "npm", version: "13.5.6" },
  ];

  const handleRunFirstCheck = async () => {
    setIsChecking(true);
    setCheckProgressText("Identifying software...");

    setTimeout(() => {
      setCheckProgressText("Checking published security advisories in OSV.dev...");
    }, 600);

    setTimeout(() => {
      setCheckProgressText("Matching affected versions and exploit records...");
    }, 1200);

    try {
      const res = await fetch(
        `/api/vuln/check?name=${encodeURIComponent(softwareName)}&ecosystem=${encodeURIComponent(
          ecosystem
        )}&version=${encodeURIComponent(version)}`
      );
      const data = await res.json();
      setCheckResults(data);
    } catch {
      setCheckResults({ totalFindings: 0, summary: {}, findings: [] });
    } finally {
      setIsChecking(false);
      setStep(6);
    }
  };

  const handleSaveToWatchlist = async () => {
    try {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: softwareName,
          ecosystem,
          currentVersion: version,
          platform: mode === "PERSONAL" ? "Desktop" : "Development",
        }),
      });
      setSavedToWatchlist(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 900);
    } catch {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col justify-between selection:bg-teal-500/30">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">SecureFlow</span>
        </div>
        <Link href="/dashboard" className="text-xs text-slate-400 hover:text-teal-300 transition">
          Skip to Dashboard &rarr;
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl bg-[#111C2E] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Top Progress Indicator */}
          {step > 1 && step < 6 && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Setup Step {step - 1} of 4</span>
                <span className="text-teal-400 font-medium">
                  {step === 2 && "Choose Mode"}
                  {step === 3 && "Select Software"}
                  {step === 4 && "Choose Version"}
                  {step === 5 && "Running Scan"}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-400 transition-all duration-300"
                  style={{ width: `${((step - 1) / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* SCREEN 1: Welcome */}
          {step === 1 && (
            <div className="text-center py-6 space-y-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 mb-2 shadow-lg shadow-teal-500/10">
                <ShieldCheck className="h-9 w-9" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Welcome to SecureFlow
                </h1>
                <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
                  “Know what’s vulnerable. Know what to update. Know how to fix it.”
                </p>
                <p className="text-xs text-slate-500">
                  Peace of mind through smarter software security. Under 2 minutes to complete.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={() => setStep(2)}
                  size="lg"
                  className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-8 gap-2 shadow-lg shadow-teal-500/20"
                >
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full border-slate-700 text-slate-300">
                    Explore Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* SCREEN 2: Choose Experience */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-white">Choose your experience</h2>
                <p className="text-xs text-slate-400">
                  You can switch between modes at any time from the top navigation.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Personal */}
                <div
                  onClick={() => {
                    setMode("PERSONAL");
                    setSoftwareName("Google Chrome");
                    setEcosystem("General");
                    setVersion("128.0.6613.84");
                  }}
                  className={`cursor-pointer rounded-xl p-5 border transition-all ${
                    mode === "PERSONAL"
                      ? "bg-teal-500/10 border-teal-500/50 shadow-md shadow-teal-500/10"
                      : "bg-[#17243A] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300">
                      <Laptop className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-white text-base">Personal Security</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Monitor your desktop applications, browsers, and devices for known risks with plain-English instructions and official vendor updates.
                  </p>
                </div>

                {/* Developer */}
                <div
                  onClick={() => {
                    setMode("DEVELOPER");
                    setSoftwareName("lodash");
                    setEcosystem("npm");
                    setVersion("4.17.15");
                  }}
                  className={`cursor-pointer rounded-xl p-5 border transition-all ${
                    mode === "DEVELOPER"
                      ? "bg-blue-500/10 border-blue-500/50 shadow-md shadow-blue-500/10"
                      : "bg-[#17243A] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
                      <Code2 className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-white text-base">Developer Security</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Monitor frameworks, dependencies, and lockfiles across npm, PyPI, Go, and Cargo with CVSS metrics and upgrade commands.
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <Button variant="ghost" onClick={() => setStep(1)} className="text-slate-400">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold gap-1.5"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* SCREEN 3: Add First Software */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-white">Add your first software</h2>
                <p className="text-xs text-slate-400">
                  Select a common application or framework to begin monitoring.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-300">Recommended starting points:</label>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {(mode === "PERSONAL" ? personalSuggestions : developerSuggestions).map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setSoftwareName(item.name);
                        setEcosystem(item.ecosystem);
                        setVersion(item.version);
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition ${
                        softwareName === item.name
                          ? "bg-teal-500/10 border-teal-500 text-white"
                          : "bg-[#17243A] border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-medium text-sm text-white">{item.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {item.ecosystem} &bull; Sample: v{item.version}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-slate-700">
                        Select
                      </Badge>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                    Or type custom software name:
                  </label>
                  <input
                    type="text"
                    value={softwareName}
                    onChange={(e) => setSoftwareName(e.target.value)}
                    className="w-full bg-[#17243A] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
                    placeholder="e.g. react, requests, Chrome"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" onClick={() => setStep(2)} className="text-slate-400">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold gap-1.5"
                >
                  Next: Select Version <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* SCREEN 4: Version Selection */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-white">Select your version</h2>
                <p className="text-xs text-slate-400">
                  Software security depends on the exact version you run.
                </p>
              </div>

              <div className="bg-[#17243A] p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Selected Software:</span>
                  <span className="text-xs font-semibold text-teal-300">{softwareName}</span>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Installed Version:
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full bg-[#111C2E] border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-400 font-mono"
                    placeholder="e.g. 1.0.0 or 4.17.15"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setVersion("unknown")}
                    className="text-[11px] border-slate-700 text-slate-300"
                  >
                    I don&apos;t know my version
                  </Button>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Tip: To check Chrome version, go to Menu &rarr; Help &rarr; About Google Chrome. For npm packages, inspect package.json or run <code className="text-teal-300">npm list &lt;name&gt;</code>.
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" onClick={() => setStep(3)} className="text-slate-400">
                  Back
                </Button>
                <Button
                  onClick={handleRunFirstCheck}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold gap-2"
                >
                  <Sparkles className="h-4 w-4" /> Run First Security Check
                </Button>
              </div>
            </div>
          )}

          {/* SCREEN 5: Scanning Progress */}
          {step === 5 && (
            <div className="text-center py-12 space-y-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 animate-spin">
                <RefreshCw className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Analyzing Security Advisories</h3>
                <p className="text-xs text-teal-300 font-mono">{checkProgressText}</p>
                <p className="text-[11px] text-slate-500">Connecting to live OSV.dev and CISA KEV catalog</p>
              </div>
            </div>
          )}

          {/* SCREEN 6: Results & Watchlist */}
          {step === 6 && checkResults && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <Badge
                  className={`text-xs px-3 py-1 ${
                    checkResults.summary?.confirmedCount > 0
                      ? "bg-red-500/20 text-red-300 border-red-500/30"
                      : "bg-teal-500/20 text-teal-300 border-teal-500/30"
                  }`}
                >
                  {checkResults.summary?.confirmedCount > 0
                    ? `${checkResults.summary.confirmedCount} Confirmed Vulnerabilities Found`
                    : "No Confirmed Vulnerabilities in Queried Range"}
                </Badge>
                <h2 className="text-2xl font-bold text-white">
                  Security Check for {softwareName} v{version}
                </h2>
                <p className="text-xs text-slate-400">
                  Data source: {checkResults.source || "OSV.dev"} &bull; Real-time analysis
                </p>
              </div>

              {/* Finding Highlight Card */}
              <div className="bg-[#17243A] p-4 rounded-xl border border-slate-800 space-y-3">
                {checkResults.findings && checkResults.findings.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {checkResults.findings.slice(0, 2).map((f: any) => (
                      <div
                        key={f.advisoryId}
                        className="p-3 bg-[#111C2E] rounded-lg border border-slate-800 flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            {f.advisoryId}
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                f.priority === "FIX_URGENTLY"
                                  ? "bg-red-500/20 text-red-300"
                                  : "bg-amber-500/20 text-amber-300"
                              }`}
                            >
                              {f.priority.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] line-clamp-2 mt-0.5">{f.summary}</p>
                          <div className="text-[10px] text-teal-400 mt-1">
                            Recommended Fix: {f.recommendedFix || "Upgrade to latest release"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-300">
                    <CheckCircle2 className="h-6 w-6 text-teal-400 mx-auto mb-1.5" />
                    No known applicable vulnerabilities found for this version in our databases.
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleSaveToWatchlist}
                  disabled={savedToWatchlist}
                  className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {savedToWatchlist ? "Saved! Redirecting to Dashboard..." : "Save to My Watchlist & Continue"}
                </Button>
                <div className="text-center">
                  <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white">
                    Continue to Dashboard without saving
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500">
        SecureFlow &bull; Grounded Vulnerability Intelligence &bull; Privacy-First Software Protection
      </footer>
    </div>
  );
}
