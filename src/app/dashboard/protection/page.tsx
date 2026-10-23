"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Laptop,
  Smartphone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function UserProtectionPage() {
  const [recommendations, setRecommendations] = useState([
    {
      id: "rec1",
      title: "Activate Hardware FIDO2 WebAuthn Key",
      description: "Hardware security keys protect your finance transactions from session-hijacking and phishing proxies.",
      priority: "HIGH",
      done: false,
    },
    {
      id: "rec2",
      title: "Review Authorized OAuth Application Consents",
      description: "Remove 3 third-party apps that haven't been accessed in the last 90 days.",
      priority: "MEDIUM",
      done: true,
    },
    {
      id: "rec3",
      title: "Confirm Workstation OS Security Patch (macOS 15.1)",
      description: "Ensure your primary MacBook Pro has downloaded latest security patches.",
      priority: "LOW",
      done: true,
    },
  ]);

  const toggleRec = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          My Protection & Hygiene
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Overview of your monitored devices, corporate identity status, and recommended security enhancements.
        </p>
      </div>

      {/* Monitored Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Laptop className="w-5 h-5 text-teal-400" />
              <CardTitle className="text-base text-white">Work Laptop</CardTitle>
            </div>
            <Badge variant="outline" className="text-teal-300 border-teal-500/40 bg-teal-500/10 text-[10px]">
              Active EDR
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Device:</span>
              <strong className="text-slate-200">MacBook Pro (M3 Max)</strong>
            </div>
            <div className="flex justify-between">
              <span>Disk Encryption:</span>
              <strong className="text-emerald-400">FileVault Enabled</strong>
            </div>
            <div className="flex justify-between">
              <span>Last Heartbeat:</span>
              <span className="text-slate-300">2 minutes ago</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-teal-400" />
              <CardTitle className="text-base text-white">Corporate Identity</CardTitle>
            </div>
            <Badge variant="outline" className="text-teal-300 border-teal-500/40 bg-teal-500/10 text-[10px]">
              Protected
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Single Sign-On:</span>
              <strong className="text-slate-200">Okta Verified</strong>
            </div>
            <div className="flex justify-between">
              <span>MFA Protocol:</span>
              <strong className="text-emerald-400">Authenticator App</strong>
            </div>
            <div className="flex justify-between">
              <span>Session Policy:</span>
              <span className="text-slate-300">8h Max Timeout</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-teal-400" />
              <CardTitle className="text-base text-white">Mobile Device</CardTitle>
            </div>
            <Badge variant="outline" className="text-teal-300 border-teal-500/40 bg-teal-500/10 text-[10px]">
              Managed
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Model:</span>
              <strong className="text-slate-200">iPhone 16 Pro</strong>
            </div>
            <div className="flex justify-between">
              <span>MDM Profile:</span>
              <strong className="text-emerald-400">Enrolled & Compliant</strong>
            </div>
            <div className="flex justify-between">
              <span>Biometrics:</span>
              <span className="text-slate-300">FaceID Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Recommendations Checklist */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Security Recommendations for You
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Practical steps recommended by your security team to strengthen protection.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec) => (
            <Card
              key={rec.id}
              className={`border-slate-800 transition-all ${
                rec.done ? "bg-slate-900/30 opacity-70" : "bg-slate-900/70"
              }`}
            >
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleRec(rec.id)}
                    className="mt-0.5 text-slate-400 hover:text-teal-400 transition"
                  >
                    {rec.done ? (
                      <CheckCircle2 className="w-5 h-5 text-teal-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-600 hover:border-teal-400" />
                    )}
                  </button>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${rec.done ? "line-through text-slate-400" : "text-white"}`}>
                        {rec.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] py-0 px-1.5 ${
                          rec.priority === "HIGH"
                            ? "text-amber-400 border-amber-500/30"
                            : "text-slate-400 border-slate-700"
                        }`}
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                      {rec.description}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleRec(rec.id)}
                  className="text-xs border-slate-700 bg-slate-800 text-slate-300 hover:text-white shrink-0"
                >
                  {rec.done ? "Completed" : "Mark as Done"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
