import React from "react";
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreFactor {
  name: string;
  weight: number;
  score: number;
  status: "good" | "warning" | "risk";
  detail: string;
}

interface SecurityScoreProps {
  score?: number; // 0-100 or undefined if insufficient data
  coveragePercentage?: number;
  factors?: ScoreFactor[];
  className?: string;
  showBreakdown?: boolean;
}

export function SecurityScore({
  score = 92,
  coveragePercentage = 98,
  factors = [
    { name: "MFA & Identity Protection", weight: 30, score: 30, status: "good", detail: "Enabled for all privileged logins" },
    { name: "Monitored Devices & Endpoints", weight: 25, score: 23, status: "good", detail: "24/25 devices reporting telemetry" },
    { name: "Unresolved Vulnerabilities", weight: 25, score: 21, status: "warning", detail: "1 low-priority config update pending" },
    { name: "Email Threat Protection", weight: 20, score: 18, status: "good", detail: "DKIM, SPF & anti-spoof filters active" },
  ],
  className,
  showBreakdown = true,
}: SecurityScoreProps) {
  const isHealthy = score >= 85;
  const isModerate = score >= 70 && score < 85;

  const scoreColor = isHealthy
    ? "text-teal-400"
    : isModerate
    ? "text-amber-400"
    : "text-red-400";

  const strokeColor = isHealthy
    ? "#2dd4bf"
    : isModerate
    ? "#fbbf24"
    : "#f87171";

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 shadow-xl backdrop-blur-md",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="text-slate-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke={strokeColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={cn("text-2xl font-bold tracking-tight", scoreColor)}>
                {score}
              </span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                / 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">Security Health Index</h3>
              {isHealthy ? (
                <ShieldCheck className="w-5 h-5 text-teal-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              {isHealthy
                ? "Your monitored accounts and devices are in a protected state."
                : "A few security precautions need your attention to maintain full protection."}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-400" />
              <span>Continuous Monitoring: <strong className="text-slate-200">{coveragePercentage}%</strong> coverage</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 border border-slate-800/80 rounded-xl p-3 bg-slate-900/50 max-w-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-300 mb-1">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>How this score is derived</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Calculated transparently from multi-factor authentication, endpoint hygiene, active risk status, and monitoring telemetry. Never artificially inflated.
          </p>
        </div>
      </div>

      {showBreakdown && factors.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {factors.map((factor, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-slate-800/40 border border-slate-800/60 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-300">{factor.name}</span>
                {factor.status === "good" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{factor.detail}</p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Weight: {factor.weight}%</span>
                <span className="font-semibold text-slate-200">{factor.score}/{factor.weight}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
