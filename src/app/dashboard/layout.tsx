import React from "react";
import { RoleSwitchBanner } from "@/components/shared/role-switch-banner";
import { Navbar } from "@/components/shared/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      <RoleSwitchBanner />
      <Navbar />
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}
