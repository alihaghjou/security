"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  User,
  Wrench,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Lock,
  CheckCircle2,
  BellRing,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleSwitchBanner } from "@/components/shared/role-switch-banner";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      <RoleSwitchBanner />

      {/* Top Public Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">SecureFlow</span>
              <span className="text-[10px] text-teal-400 block font-medium">Intelligent Defense</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button size="sm" variant="outline" className="border-slate-800 bg-slate-900 text-xs text-slate-200 hover:text-white">
                Everyday User
              </Button>
            </Link>
            <Link href="/technician">
              <Button size="sm" variant="outline" className="border-slate-800 bg-slate-900 text-xs text-amber-300 hover:text-white">
                Technician Workspace
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="sm" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs">
                Admin Console
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Cybersecurity Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            From security alerts to <br />
            <span className="bg-gradient-to-r from-teal-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">
              security confidence.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Make cybersecurity feel like peace of mind, not another noisy alert system. Intelligent incident routing, calm plain-language updates, and verified remediation.
          </p>

          {/* Quick CTA to Experiences */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold gap-2 shadow-lg shadow-teal-500/20">
                <User className="w-4 h-4" />
                <span>Launch Everyday User View</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/technician">
              <Button size="lg" variant="secondary" className="gap-2 bg-slate-900 border-slate-700 text-slate-200 hover:text-white">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Open Technician SOC Workspace</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 User Roles Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Three Tailored Experiences, One Secure Core
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Engineered so everyone in the organization knows what happened, who is handling it, and whether action is needed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Role A Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 hover:border-teal-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Everyday User</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mobile-first calm experience. Jargon-free threat explanations, one-tap identity verification (&quot;Was this you?&quot;), verified technician badges, and direct support chat.
              </p>
            </div>
            <Link href="/dashboard" className="pt-2">
              <Button size="sm" className="w-full bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs">
                Enter User Dashboard
              </Button>
            </Link>
          </div>

          {/* Role B Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Security Technician</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Desktop-first SOC triage workspace. Skill-matched assignment queues, SLA deadlines, raw telemetry inspection, runbooks, AI briefs, and resolution verification.
              </p>
            </div>
            <Link href="/technician" className="pt-2">
              <Button size="sm" className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs">
                Enter Technician Workspace
              </Button>
            </Link>
          </div>

          {/* Role C Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 hover:border-purple-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Organization Administrator</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Centralized organizational oversight. SLA performance tracking, team workload meters, multi-tenant isolation, automated escalation rules, and immutable audit trails.
              </p>
            </div>
            <Link href="/admin" className="pt-2">
              <Button size="sm" className="w-full bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 text-xs">
                Enter Admin Console
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Credentials & Local Scenarios Card */}
      <section className="max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="p-6 rounded-2xl border border-teal-500/20 bg-slate-900/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-400" />
              <h2 className="font-semibold text-sm text-white">Local Demo Credentials & Seeded Users</h2>
            </div>
            <Badge variant="outline" className="text-xs text-teal-300 border-teal-500/30 bg-teal-500/5">
              Instant Exploration
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-semibold text-teal-300 block">Everyday User</span>
              <div className="font-mono text-slate-300">sarah@acme-corp.demo</div>
              <div className="text-[11px] text-slate-500">Password: demo-password</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-semibold text-amber-300 block">Security Technician</span>
              <div className="font-mono text-slate-300">alex@secureflow.demo</div>
              <div className="text-[11px] text-slate-500">Password: demo-password</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-semibold text-purple-300 block">Organization Admin</span>
              <div className="font-mono text-slate-300">jordan@acme-corp.demo</div>
              <div className="text-[11px] text-slate-500">Password: demo-password</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-400" />
            <span className="font-semibold text-slate-300">SecureFlow</span>
            <span>— Intelligent Cybersecurity Platform</span>
          </div>
          <span>Demo Environment · Powered by Next.js & PostgreSQL</span>
        </div>
      </footer>
    </div>
  );
}
