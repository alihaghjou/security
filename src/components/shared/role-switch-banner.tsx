"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  User,
  Wrench,
  ShieldCheck,
  Play,
  Check,
  ChevronDown,
  Sparkles,
  Layers,
  AlertOctagon,
  RefreshCw,
  BellRing,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function RoleSwitchBanner() {
  return (
    <React.Suspense fallback={<div className="h-8 bg-slate-950" />}>
      <RoleSwitchBannerContent />
    </React.Suspense>
  );
}

function RoleSwitchBannerContent() {
  const pathname = usePathname();
  const router = useRouter();
  const [scenarioLoading, setScenarioLoading] = useState<string | null>(null);
  const [scenarioSuccess, setScenarioSuccess] = useState<string | null>(null);
  const [showSimModal, setShowSimModal] = useState(false);

  // Determine current active perspective
  const currentRole = pathname.startsWith("/admin")
    ? "ADMIN"
    : pathname.startsWith("/technician")
    ? "TECHNICIAN"
    : "USER";

  const triggerScenario = async (scenarioNumber: number, title: string) => {
    setScenarioLoading(`scenario-${scenarioNumber}`);
    setScenarioSuccess(null);
    try {
      const res = await fetch("/api/demo/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenarioNumber }),
      });
      const data = await res.json();
      if (res.ok) {
        setScenarioSuccess(`Scenario ${scenarioNumber} Triggered: ${data.message || "Created"}`);
        router.refresh();
        setTimeout(() => setScenarioSuccess(null), 6000);
      } else {
        alert("Failed to trigger demo scenario: " + (data.error || "Unknown error"));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert("Error triggering scenario: " + message);
    } finally {
      setScenarioLoading(null);
      setShowSimModal(false);
    }
  };

  return (
    <aside aria-label="Demo environment controls" className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-teal-500/20 text-xs text-slate-300 py-2 px-4 shadow-sm z-40 relative">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Product Environment Tag */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
          </span>
          <span className="font-semibold text-slate-100 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            SecureFlow Interactive Demo
          </span>
          <Badge variant="outline" className="text-[10px] py-0 px-2 text-teal-300 border-teal-500/30 bg-teal-500/5">
            Local Live Instance
          </Badge>
        </div>

        {/* Center: Quick Switch Roles */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              currentRole === "USER"
                ? "bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Everyday User</span>
          </Link>

          <Link
            href="/technician"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              currentRole === "TECHNICIAN"
                ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Security Technician</span>
          </Link>

          <Link
            href="/admin"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              currentRole === "ADMIN"
                ? "bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Organization Admin</span>
          </Link>
        </div>

        {/* Right: Interactive Scenario Launcher */}
        <div className="flex items-center gap-2">
          {scenarioSuccess && (
            <span className="text-emerald-400 text-xs flex items-center gap-1 font-medium animate-pulse">
              <Check className="w-3.5 h-3.5" />
              {scenarioSuccess}
            </span>
          )}

          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSimModal(!showSimModal)}
              className="h-7 text-xs gap-1.5 bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-200"
            >
              <Play className="w-3 h-3 text-teal-400 fill-teal-400" />
              <span>Launch Demo Scenarios</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </Button>

            {showSimModal && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    Interactive Scenarios
                  </span>
                  <span className="text-[10px] text-slate-500">Live Seeded Actions</span>
                </div>

                <div className="space-y-1.5">
                  <button
                    onClick={() => triggerScenario(1, "Suspicious Login")}
                    disabled={scenarioLoading !== null}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition flex items-start gap-2.5"
                  >
                    <User className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-slate-200 text-xs">Scenario 1: Suspicious Login</div>
                      <div className="text-[11px] text-slate-400">Routes to Identity Tech, asks user &quot;Was this you?&quot;</div>
                    </div>
                  </button>

                  <button
                    onClick={() => triggerScenario(2, "Malware Alert")}
                    disabled={scenarioLoading !== null}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition flex items-start gap-2.5"
                  >
                    <AlertOctagon className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-slate-200 text-xs">Scenario 2: Malware Detection</div>
                      <div className="text-[11px] text-slate-400">Routes to Endpoint Tech for containment & isolation</div>
                    </div>
                  </button>

                  <button
                    onClick={() => triggerScenario(3, "Technician Unavailable")}
                    disabled={scenarioLoading !== null}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition flex items-start gap-2.5"
                  >
                    <BellRing className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-slate-200 text-xs">Scenario 3: Missed Ack Escalation</div>
                      <div className="text-[11px] text-slate-400">Auto-escalates past-deadline assignment to backup</div>
                    </div>
                  </button>

                  <button
                    onClick={() => triggerScenario(4, "Duplicate Alerts")}
                    disabled={scenarioLoading !== null}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition flex items-start gap-2.5"
                  >
                    <Layers className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-slate-200 text-xs">Scenario 4: Duplicate Alert Grouping</div>
                      <div className="text-[11px] text-slate-400">Correlates repeated telemetry into 1 incident</div>
                    </div>
                  </button>

                  <button
                    onClick={() => triggerScenario(5, "Incident Resolution")}
                    disabled={scenarioLoading !== null}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition flex items-start gap-2.5"
                  >
                    <RefreshCw className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-slate-200 text-xs">Scenario 5: Verified Resolution</div>
                      <div className="text-[11px] text-slate-400">Verifies fix, generates summary, reassures user</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
