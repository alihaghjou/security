"use client";

import React, { useState } from "react";
import { Sliders, Clock, Bell, AlertTriangle, Save, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function AdminEscalationPage() {
  const [saved, setSaved] = useState(false);
  const [policies, setPolicies] = useState([
    {
      id: "p1",
      severity: "CRITICAL",
      name: "Critical Incident Rapid SLA",
      deadlineMinutes: 15,
      backupTarget: "Elena Rostova (Secondary Lead)",
      notifyAdmins: true,
      active: true,
    },
    {
      id: "p2",
      severity: "HIGH",
      name: "High Priority Security Breach",
      deadlineMinutes: 30,
      backupTarget: "Elena Rostova (Secondary Lead)",
      notifyAdmins: true,
      active: true,
    },
    {
      id: "p3",
      severity: "MEDIUM",
      name: "Moderate Telemetry Anomaly",
      deadlineMinutes: 60,
      backupTarget: "Rotational SOC Tier 2",
      notifyAdmins: false,
      active: true,
    },
  ]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Escalation Policies & SLA Deadlines
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure automated technician acknowledgment windows, backup failover routes, and anti-loop safeguards.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Escalation policies updated successfully.</span>
        </div>
      )}

      {/* SLA Policy Cards */}
      <div className="space-y-4">
        {policies.map((p, idx) => (
          <Card key={p.id} className="border-slate-800 bg-slate-900/60">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        p.severity === "CRITICAL"
                          ? "text-red-400 border-red-500/40 bg-red-500/10"
                          : p.severity === "HIGH"
                          ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
                          : "text-yellow-400 border-yellow-500/40 bg-yellow-500/10"
                      }`}
                    >
                      {p.severity}
                    </Badge>
                    <h2 className="text-base font-semibold text-white">{p.name}</h2>
                  </div>
                  <p className="text-xs text-slate-400 max-w-xl">
                    If an assigned technician does not acknowledge within the deadline window, SecureFlow records the missed SLA attempt and automatically escalates to the designated backup without triggering duplicate alert loops.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Ack Deadline:</span>
                    <span className="font-mono text-sm font-bold text-teal-400">
                      {p.deadlineMinutes} minutes
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Failover Target:</span>
                    <span className="font-semibold text-slate-200">
                      {p.backupTarget}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Policy Active:</span>
                    <Switch checked={p.active} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs">
          <Save className="w-3.5 h-3.5 mr-1.5" />
          Save Escalation Configuration
        </Button>
      </div>
    </div>
  );
}
