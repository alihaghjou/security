"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Database, ArrowRight, ShieldCheck, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThreatCategoryBadge } from "@/components/shared/threat-category-badge";

export default function TechnicianSearchPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/incidents")
      .then((res) => res.json())
      .then((data) => setIncidents(data.incidents || []));
  }, []);

  const results = query.trim()
    ? incidents.filter(
        (i) =>
          i.title.toLowerCase().includes(query.toLowerCase()) ||
          i.description.toLowerCase().includes(query.toLowerCase()) ||
          i.category.toLowerCase().includes(query.toLowerCase()) ||
          (i.affectedUser?.email || "").toLowerCase().includes(query.toLowerCase()) ||
          i.securityEvents?.some(
            (e: any) =>
              (e.sourceIp || "").includes(query) ||
              (e.targetAsset || "").toLowerCase().includes(query.toLowerCase())
          )
      )
    : incidents;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Historical Incident & IOC Search
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Perform forensic searches across past incidents, IP addresses, file hashes, and user sessions.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by IP (e.g. 185.220.101.5), SHA256 hash, asset name, or user..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 text-xs bg-slate-900 border-slate-800 h-10"
          />
        </div>
        {query && (
          <Button variant="ghost" size="sm" onClick={() => setQuery("")} className="text-xs">
            Clear
          </Button>
        )}
      </div>

      {/* Suggested Quick Searches */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span>Suggested Queries:</span>
        {["185.220.101.5", "invoice_details.exe", "sarah@acme-corp.demo", "WKSTN-FIN-04", "IDENTITY"].map((q) => (
          <button
            key={q}
            onClick={() => setQuery(q)}
            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-teal-300 hover:border-teal-500 font-mono"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Search Results */}
      <div className="space-y-3 pt-2">
        <span className="text-xs text-slate-400 font-medium">
          Found {results.length} incident records matching query
        </span>

        {results.map((inc) => (
          <Card key={inc.id} className="border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-all">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={inc.severity} />
                  <ThreatCategoryBadge category={inc.category} />
                  <StatusBadge status={inc.status} />
                  <span className="text-xs text-slate-500 font-mono">
                    Case: {inc.id.slice(0, 10)}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-white">{inc.title}</h3>
                <p className="text-xs text-slate-400 font-mono line-clamp-1">{inc.description}</p>
              </div>

              <Link href={`/technician/incidents/${inc.id}`}>
                <Button size="sm" variant="outline" className="border-slate-700 bg-slate-800 text-xs text-slate-200">
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
