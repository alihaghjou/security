"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Bell,
  CheckCircle,
  Menu,
  X,
  ExternalLink,
  LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  severity: string;
  isRead: boolean;
  createdAt: string;
}

export function Navbar() {
  return (
    <React.Suspense fallback={<div className="h-16 bg-slate-950" />}>
      <NavbarContent />
    </React.Suspense>
  );
}

function NavbarContent() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch in-app notifications
  useEffect(() => {
    fetch("/api/notifications?limit=5")
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount || 0);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  // Determine role based on URL
  const isAdmin = pathname.startsWith("/admin");
  const isTechnician = pathname.startsWith("/technician");
  const isUser = !isAdmin && !isTechnician && !pathname.startsWith("/auth") && pathname !== "/";

  // Navigation Links based on role
  let navLinks: { label: string; href: string }[] = [];
  if (isUser) {
    navLinks = [
      { label: "Overview", href: "/dashboard" },
      { label: "Active Alerts", href: "/dashboard/alerts" },
      { label: "My Protection", href: "/dashboard/protection" },
      { label: "Security Support", href: "/dashboard/support" },
      { label: "Profile", href: "/dashboard/profile" },
    ];
  } else if (isTechnician) {
    navLinks = [
      { label: "Incident Queue", href: "/technician" },
      { label: "Active Investigations", href: "/technician/investigations" },
      { label: "On-Call & Shifts", href: "/technician/availability" },
      { label: "Security Runbooks", href: "/technician/runbooks" },
      { label: "Case Search", href: "/technician/search" },
    ];
  } else if (isAdmin) {
    navLinks = [
      { label: "Organization Overview", href: "/admin" },
      { label: "Incidents", href: "/admin/incidents" },
      { label: "Technicians", href: "/admin/technicians" },
      { label: "Users & Access", href: "/admin/users" },
      { label: "Escalation Rules", href: "/admin/escalation" },
      { label: "Integrations", href: "/admin/integrations" },
      { label: "Reports & Audit", href: "/admin/reports" },
    ];
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 group-hover:scale-105 transition-transform shadow-sm">
                <Shield className="w-5 h-5 text-teal-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  SecureFlow
                </span>
                <span className="text-[10px] text-teal-400/90 font-medium tracking-wide">
                  Intelligent Defense
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/dashboard" && link.href !== "/technician" && link.href !== "/admin" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      isActive
                        ? "bg-slate-800 text-teal-300 font-semibold border border-slate-700/80"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right actions: Notifications, Org Tag, Profile */}
          <div className="flex items-center gap-3">
            {/* Organization Tag */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-medium text-slate-200">Acme Corp</span>
              <span className="text-[10px] text-slate-500 uppercase">Production Tenant</span>
            </div>

            {/* Notification Center */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative text-slate-300 hover:text-white"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                  </span>
                )}
              </Button>

              {/* Notification Popover Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-100">Notifications</span>
                      {unreadCount > 0 && (
                        <Badge variant="outline" className="text-[10px] bg-teal-500/10 text-teal-300 border-teal-500/30">
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto mt-2">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        No notifications right now. Systems are operating normally.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`py-3 px-1 transition-colors ${
                            !n.isRead ? "bg-slate-800/20" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium text-xs text-slate-200">{n.title}</span>
                            <span className="text-[10px] text-slate-500 shrink-0">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {n.body}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 mt-2 text-center">
                    <Link
                      href={isUser ? "/dashboard/alerts" : isTechnician ? "/technician" : "/admin/incidents"}
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-teal-400 hover:text-teal-300 font-medium inline-flex items-center gap-1"
                    >
                      <span>View full incident stream</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  {isUser ? "SJ" : isTechnician ? "AC" : "JL"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-200">
                  {isUser ? "Sarah Jenkins" : isTechnician ? "Alex Chen" : "Jordan Lee"}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isUser ? "Finance Lead" : isTechnician ? "SOC L2 Specialist" : "Admin"}
                </span>
              </div>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-300"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-teal-400"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
