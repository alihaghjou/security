"use client";

import React, { useState } from "react";
import { Wrench, Shield, CheckCircle2, UserCheck, Plus, Edit2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminTechniciansPage() {
  const [technicians, setTechnicians] = useState([
    {
      id: "tech-1",
      name: "Alex Chen",
      email: "alex@secureflow.demo",
      role: "Security Technician L2",
      specializations: ["IDENTITY", "ENDPOINT"],
      isAvailable: true,
      isOnCall: true,
      currentLoad: 2,
      maxCapacity: 6,
    },
    {
      id: "tech-2",
      name: "Elena Rostova",
      email: "elena@secureflow.demo",
      role: "Security Technician L2",
      specializations: ["EMAIL", "NETWORK", "CLOUD"],
      isAvailable: true,
      isOnCall: false,
      currentLoad: 1,
      maxCapacity: 5,
    },
    {
      id: "tech-3",
      name: "Marcus Vance",
      email: "marcus.vance@secureflow.demo",
      role: "Senior SOC Lead",
      specializations: ["DATA", "APPLICATION", "IDENTITY"],
      isAvailable: true,
      isOnCall: false,
      currentLoad: 0,
      maxCapacity: 8,
    },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Security Technician Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your SOC responder roster, certified skill sets, on-call schedules, and routing capacity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {technicians.map((t) => {
          const loadPercent = Math.round((t.currentLoad / t.maxCapacity) * 100);
          return (
            <Card key={t.id} className="border-slate-800 bg-slate-900/60">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-slate-700">
                      <AvatarFallback className="bg-purple-500/10 text-purple-300 font-semibold text-xs">
                        {t.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                        {t.name}
                        {t.isOnCall && (
                          <Badge variant="outline" className="text-[9px] text-teal-400 border-teal-500/40 bg-teal-500/10">
                            On-Call
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{t.email}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Workload:</span>
                    <strong className="text-slate-200">{t.currentLoad} / {t.maxCapacity} active tickets</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-400" style={{ width: `${loadPercent}%` }} />
                  </div>
                </div>

                <div className="pt-2 text-xs">
                  <span className="text-slate-400 block mb-1 font-medium">Certified Specializations:</span>
                  <div className="flex flex-wrap gap-1">
                    {t.specializations.map((s) => (
                      <span key={s} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Available for Routing
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
