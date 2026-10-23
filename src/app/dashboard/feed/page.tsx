"use client";

import React, { useState, useEffect } from "react";
import {
  Newspaper,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SecurityFeedPage() {
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/security-feed")
      .then((res) => res.json())
      .then((data) => setFeedItems(data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = feedItems.filter((item) => {
    if (filter === "ALL") return true;
    if (filter === "KEV") return item.category === "EXPLOITED_IN_THE_WILD";
    if (filter === "UPDATES") return item.category === "SECURITY_UPDATE";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Newspaper className="h-6 w-6 text-teal-400" />
            Security Intelligence Feed
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Verified vulnerability advisories, CISA KEV notices, and software security releases.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#111C2E] p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1 rounded-lg transition ${
              filter === "ALL" ? "bg-teal-500/20 text-teal-300 font-semibold" : "text-slate-400"
            }`}
          >
            All Updates
          </button>
          <button
            onClick={() => setFilter("KEV")}
            className={`px-3 py-1 rounded-lg transition ${
              filter === "KEV" ? "bg-red-500/20 text-red-300 font-semibold" : "text-slate-400"
            }`}
          >
            CISA KEV (Exploited)
          </button>
          <button
            onClick={() => setFilter("UPDATES")}
            className={`px-3 py-1 rounded-lg transition ${
              filter === "UPDATES" ? "bg-blue-500/20 text-blue-300 font-semibold" : "text-slate-400"
            }`}
          >
            Vendor Patches
          </button>
        </div>
      </div>

      {/* Feed Cards */}
      {loading ? (
        <div className="p-16 text-center bg-[#111C2E] rounded-2xl border border-slate-800 text-xs text-slate-400 animate-pulse">
          Loading live security bulletins...
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#111C2E] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-base">{item.title}</span>
                  {item.category === "EXPLOITED_IN_THE_WILD" ? (
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-[10px]">
                      CISA KEV
                    </Badge>
                  ) : (
                    <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/40 text-[10px]">
                      {item.category.replace(/_/g, " ")}
                    </Badge>
                  )}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      item.severity === "CRITICAL"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span>{item.date}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>

              {/* Recommended Action */}
              <div className="p-3 bg-[#17243A] rounded-xl border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-400 shrink-0" />
                  <span className="text-slate-300 font-medium">{item.actionRecommended}</span>
                </div>
                <div className="text-[11px] text-slate-400 shrink-0">
                  Source: <span className="text-slate-200">{item.source}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
