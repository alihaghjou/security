"use client";

import React, { useState } from "react";
import { Users, Shield, UserCheck, ShieldAlert, Plus, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
  const [members, setMembers] = useState([
    {
      id: "u1",
      name: "Sarah Jenkins",
      email: "sarah@acme-corp.demo",
      role: "USER",
      department: "Finance Operations",
      status: "Active",
      mfaEnabled: true,
    },
    {
      id: "u2",
      name: "Marcus Wright",
      email: "marcus@acme-corp.demo",
      role: "USER",
      department: "Engineering Lead",
      status: "Active",
      mfaEnabled: true,
    },
    {
      id: "u3",
      name: "Alex Chen",
      email: "alex@secureflow.demo",
      role: "TECHNICIAN",
      department: "Security Operations Center",
      status: "Active",
      mfaEnabled: true,
    },
    {
      id: "u4",
      name: "Elena Rostova",
      email: "elena@secureflow.demo",
      role: "TECHNICIAN",
      department: "Security Operations Center",
      status: "Active",
      mfaEnabled: true,
    },
    {
      id: "u5",
      name: "Jordan Lee",
      email: "jordan@acme-corp.demo",
      role: "ADMIN",
      department: "Corporate IT & Security",
      status: "Active",
      mfaEnabled: true,
    },
    {
      id: "u6",
      name: "Taylor Vance",
      email: "taylor@secureflow.demo",
      role: "MSSP_ADMIN",
      department: "Managed Security Provider",
      status: "Active",
      mfaEnabled: true,
    },
  ]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40">Org Admin</Badge>;
      case "TECHNICIAN":
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40">Technician</Badge>;
      case "MSSP_ADMIN":
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40">MSSP Partner</Badge>;
      default:
        return <Badge className="bg-slate-800 text-slate-300 border-slate-700">Everyday User</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Users & Organization Access
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enforce role-based access control (RBAC), multi-factor enforcement, and cross-tenant boundary isolation.
          </p>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">MFA State</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{m.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{m.email}</div>
                  </td>
                  <td className="py-3 px-4">{getRoleBadge(m.role)}</td>
                  <td className="py-3 px-4 text-slate-300">{m.department}</td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-400 text-xs flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" /> Enforced
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
