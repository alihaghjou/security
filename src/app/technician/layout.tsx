import React from "react";
import { RoleSwitchBanner } from "@/components/shared/role-switch-banner";
import { Navbar } from "@/components/shared/navbar";

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <RoleSwitchBanner />
      <Navbar />
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}
