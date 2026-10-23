"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Search,
  BookmarkCheck,
  FolderGit2,
  Newspaper,
  FileBarChart2,
  Bell,
  Menu,
  X,
  Sparkles,
  Laptop,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mode, setMode] = useState<"PERSONAL" | "DEVELOPER">("PERSONAL");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("secureflow_mode");
    if (saved === "DEVELOPER" || saved === "PERSONAL") {
      setMode(saved);
    }
  }, []);

  const toggleMode = (newMode: "PERSONAL" | "DEVELOPER") => {
    setMode(newMode);
    localStorage.setItem("secureflow_mode", newMode);
    window.dispatchEvent(new CustomEvent("secureflow_mode_change", { detail: newMode }));
  };

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: ShieldCheck },
    { label: "Check Software", href: "/dashboard/search", icon: Search },
    { label: "Watchlist", href: "/dashboard/watchlist", icon: BookmarkCheck },
    {
      label: "Projects",
      href: "/dashboard/projects",
      icon: FolderGit2,
      badge: mode === "DEVELOPER" ? "Dev" : undefined,
    },
    { label: "Updates", href: "/dashboard/feed", icon: Newspaper },
    { label: "Report", href: "/dashboard/report", icon: FileBarChart2 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#0B1220]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 group-hover:bg-teal-500/20 transition">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                SecureFlow
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  v2.0
                </span>
              </span>
              <span className="text-[11px] text-slate-400 -mt-1 hidden sm:inline">
                Intelligent Vulnerability Assistant
              </span>
            </div>
          </Link>

          {/* Mode Switcher Pill */}
          <div className="hidden md:flex items-center rounded-full bg-slate-900/90 border border-slate-800 p-0.5">
            <button
              onClick={() => toggleMode("PERSONAL")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all ${
                mode === "PERSONAL"
                  ? "bg-teal-500/20 text-teal-300 shadow-sm border border-teal-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
              Personal
            </button>
            <button
              onClick={() => toggleMode("DEVELOPER")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all ${
                mode === "DEVELOPER"
                  ? "bg-blue-500/20 text-blue-300 shadow-sm border border-blue-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              Developer
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition ${
                  isActive
                    ? "bg-slate-800/80 text-teal-300 border border-slate-700/60"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
                {item.badge && (
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 rounded border border-blue-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/search">
            <Button
              size="sm"
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs shadow-sm shadow-teal-500/20 gap-1.5"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Check Software</span>
            </Button>
          </Link>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#111C2E] px-4 py-3 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs text-slate-400">Security Mode:</span>
            <div className="flex items-center rounded-full bg-slate-900 border border-slate-800 p-0.5">
              <button
                onClick={() => toggleMode("PERSONAL")}
                className={`px-2.5 py-0.5 text-xs rounded-full ${
                  mode === "PERSONAL" ? "bg-teal-500/20 text-teal-300" : "text-slate-400"
                }`}
              >
                Personal
              </button>
              <button
                onClick={() => toggleMode("DEVELOPER")}
                className={`px-2.5 py-0.5 text-xs rounded-full ${
                  mode === "DEVELOPER" ? "bg-blue-500/20 text-blue-300" : "text-slate-400"
                }`}
              >
                Developer
              </button>
            </div>
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-md ${
                  isActive
                    ? "bg-slate-800 text-teal-300 font-medium"
                    : "text-slate-300 hover:bg-slate-800/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
