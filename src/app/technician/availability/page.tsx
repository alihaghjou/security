"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  Shield,
  Save,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function TechnicianAvailabilityPage() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isOnCall, setIsOnCall] = useState(true);
  const [maxCapacity, setMaxCapacity] = useState(6);
  const [saved, setSaved] = useState(false);

  const shifts = [
    { day: "Monday", hours: "08:00 - 16:00 UTC", role: "Primary On-Call", tech: "Alex Chen" },
    { day: "Tuesday", hours: "08:00 - 16:00 UTC", role: "Primary On-Call", tech: "Alex Chen" },
    { day: "Wednesday", hours: "08:00 - 16:00 UTC", role: "Primary On-Call", tech: "Alex Chen" },
    { day: "Thursday", hours: "08:00 - 16:00 UTC", role: "Secondary Escalation", tech: "Elena Rostova" },
    { day: "Friday", hours: "08:00 - 16:00 UTC", role: "Secondary Escalation", tech: "Elena Rostova" },
    { day: "Weekend", hours: "24h PagerDuty", role: "Rotational SOC Tier 2", tech: "Alex & Elena" },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Technician Availability & On-Call Schedule
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure real-time assignment routing parameters and on-call rotation schedules.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Availability and routing thresholds updated.</span>
        </div>
      )}

      {/* Real-time Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white">Live Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-200">
                  {isAvailable ? "Accepting New Incidents" : "Paused / Offline"}
                </div>
                <div className="text-xs text-slate-400">
                  Assignment engine will route matching tickets.
                </div>
              </div>
              <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white">On-Call SLA Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-200">
                  {isOnCall ? "Active Primary Responder" : "Standby Mode"}
                </div>
                <div className="text-xs text-slate-400">
                  Priority target for urgent critical escalations.
                </div>
              </div>
              <Switch checked={isOnCall} onCheckedChange={setIsOnCall} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white">Max Concurrent Load</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Concurrent Tickets Limit:</span>
              <strong className="text-amber-300 text-base">{maxCapacity}</strong>
            </div>
            <div className="flex gap-2">
              {[4, 6, 8, 10].map((cap) => (
                <button
                  key={cap}
                  onClick={() => setMaxCapacity(cap)}
                  className={`flex-1 py-1 rounded text-xs border ${
                    maxCapacity === cap
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {cap}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Rotation Schedule Table */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            Weekly SOC Escalation & On-Call Rota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Day</th>
                  <th className="py-2.5 px-3">Shift Hours</th>
                  <th className="py-2.5 px-3">Routing Tier</th>
                  <th className="py-2.5 px-3">Assigned Specialist</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {shifts.map((shift, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-semibold text-white">{shift.day}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{shift.hours}</td>
                    <td className="py-3 px-3 text-slate-300">{shift.role}</td>
                    <td className="py-3 px-3 font-medium text-amber-300">{shift.tech}</td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="text-[10px] text-teal-400 border-teal-500/30 bg-teal-500/10">
                        Active Policy
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4 mt-2 border-t border-slate-800">
            <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs">
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Availability Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
