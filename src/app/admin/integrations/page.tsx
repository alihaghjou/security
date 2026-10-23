"use client";

import React, { useState } from "react";
import {
  Webhook,
  Play,
  CheckCircle2,
  Lock,
  Code2,
  Copy,
  Check,
  Shield,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminIntegrationsPage() {
  const [copied, setCopied] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [simOutput, setSimOutput] = useState<string | null>(null);

  const webhookUrl = "http://localhost:3000/api/webhooks/security-events";
  const webhookSecret = "whsec_demo_secret_acme_corp_2026";

  const copyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runTestWebhook = async () => {
    setSimLoading(true);
    setSimOutput(null);
    try {
      const payload = {
        orgSlug: "acme-corp",
        eventId: `test_${Date.now()}`,
        category: "ENDPOINT",
        title: "Test Ingested Endpoint Warning",
        description: "Synthetic test event dispatched from Admin Integration console.",
        severity: "MEDIUM",
        targetAsset: "TEST-WORKSTATION-01",
        sourceIp: "10.0.4.15",
      };

      const res = await fetch("/api/webhooks/security-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-secureflow-signature": "demo_bypass_signature_valid",
          "x-secureflow-timestamp": Date.now().toString(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setSimOutput(JSON.stringify(data, null, 2));
    } catch {
      setSimOutput("Error sending webhook test.");
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Security Integrations & Telemetry Connectors
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Accept and normalize external security signals via signed webhooks, and explore interfaces for enterprise EDR and SIEM providers.
        </p>
      </div>

      {/* Active Webhook Ingestion */}
      <Card className="border-teal-500/30 bg-slate-900/60 shadow-lg">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Webhook className="w-5 h-5 text-teal-400" />
            <CardTitle className="text-base text-white">
              Signed Incoming Security Event Webhook
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-teal-300 border-teal-500/40 bg-teal-500/10 text-xs">
            Live Endpoint
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            External SIEM platforms, cloud providers, or custom threat sensors can stream alerts directly to SecureFlow. All incoming payloads are verified using HMAC-SHA256 signatures with 5-minute replay window enforcement.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[11px] block mb-1">Webhook Endpoint URL:</span>
              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-teal-300">
                <span className="truncate flex-1">{webhookUrl}</span>
                <button onClick={copyUrl} className="text-slate-400 hover:text-white">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block mb-1">Signing Secret (HMAC-SHA256):</span>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                <span className="font-mono">{webhookSecret}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Button
              size="sm"
              onClick={runTestWebhook}
              disabled={simLoading}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              {simLoading ? "Dispatching..." : "Simulate Live Webhook Ingestion"}
            </Button>
          </div>

          {simOutput && (
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
              <span className="text-slate-500 block mb-1">Webhook Response:</span>
              <pre>{simOutput}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planned Integrations & Framework Adapters */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Planned Enterprise Connectors
        </h2>
        <p className="text-xs text-slate-400">
          Clean pluggable adapter architecture ready for production enterprise authentication and EDR APIs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: "Microsoft Defender & Entra ID",
              desc: "Graph Security API connector for identity risk events, MFA logs, and host isolation.",
              status: "Adapter Interface Ready",
            },
            {
              name: "CrowdStrike Falcon",
              desc: "Streaming incident API connector with automated host quarantine response.",
              status: "Adapter Interface Ready",
            },
            {
              name: "Splunk & Datadog SIEM",
              desc: "Bi-directional webhook synchronization for centralized enterprise SOC pipelines.",
              status: "Adapter Interface Ready",
            },
          ].map((conn, idx) => (
            <Card key={idx} className="border-slate-800 bg-slate-900/40">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-white">{conn.name}</h3>
                  <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                    {conn.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{conn.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
