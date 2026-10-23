"use client";

import React from "react";
import {
  LifeBuoy,
  PhoneCall,
  ShieldCheck,
  Lock,
  Mail,
  HelpCircle,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function UserSupportPage() {
  const faqs = [
    {
      q: "What should I do if I get an MFA prompt I didn't initiate?",
      a: "Always tap 'Deny' or 'No, it wasn't me'. Then report it immediately in SecureFlow. An unexpected prompt often means someone has guessed or purchased an old password and is testing your 2FA guard.",
    },
    {
      q: "How do I know if a security message is authentic?",
      a: "All verified communications from Acme Corp security appear inside this SecureFlow portal with a 'Verified Specialist' badge. Security personnel will never call or message asking you to read out a 6-digit SMS code or password.",
    },
    {
      q: "My device was quarantined by the endpoint agent. Can I still work?",
      a: "Quarantine isolates untrusted processes and temporary malicious files. Your local document editing remains available. Your technician will perform a clean check and restore normal status within minutes.",
    },
    {
      q: "I accidentally clicked a link in a suspicious email. What is my immediate step?",
      a: "Do not enter any credentials. Disconnect from public Wi-Fi if applicable, and tap 'Contact Security Support' or call our hotline so we can invalidate any temporary web session tokens.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Security Support & Assistance
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Direct access to your dedicated Security Operations Center (SOC) team. We are here to keep your work safe and calm.
        </p>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/10 text-teal-300 text-xs flex items-center gap-3">
        <Lock className="w-5 h-5 text-teal-400 shrink-0" />
        <div>
          <strong className="font-semibold text-white">Security Trust Rule: </strong>
          Authorized SecureFlow technicians will <span className="underline font-semibold">never</span> ask you for your account passwords, MFA codes, or personal recovery phrases.
        </div>
      </div>

      {/* Direct Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-red-400" />
              <CardTitle className="text-base text-white">Emergency SOC Hotline</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <p className="text-slate-400">
              For active ransomware threats, lost stolen devices, or urgent executive impersonations.
            </p>
            <div className="pt-2 text-base font-bold text-white font-mono">
              +1 (800) 555-SECURE
            </div>
            <span className="text-[11px] text-teal-400">Available 24/7/365</span>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-400" />
              <CardTitle className="text-base text-white">Assigned Primary Technician</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current On-Call Lead:</span>
              <strong className="text-slate-200">Alex Chen</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Specialization:</span>
              <span className="text-slate-300">Identity & Endpoints</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="text-emerald-400 font-medium">Online & Monitoring</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-sky-400" />
              <CardTitle className="text-base text-white">Phishing Report Mailbox</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <p className="text-slate-400">
              Forward any suspicious email directly to our automated analysis sandbox:
            </p>
            <div className="pt-2 text-xs font-mono text-teal-300 bg-slate-950 p-2 rounded border border-slate-800">
              phishing@acme-corp.demo
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-teal-400" />
          Everyday Security Guidance & FAQs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, i) => (
            <Card key={i} className="border-slate-800 bg-slate-900/50">
              <CardContent className="p-5 space-y-2">
                <h3 className="font-semibold text-sm text-slate-100">{faq.q}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
