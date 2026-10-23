import React from "react";
import { Badge } from "@/components/ui/badge";

export type FindingStatus =
  | "CONFIRMED_AFFECTED"
  | "POTENTIALLY_AFFECTED"
  | "VERIFIED_FIXED"
  | "NEEDS_VERIFICATION"
  | "RISK_ACCEPTED";

interface StatusBadgeProps {
  status: FindingStatus | string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className = "", showDot = false }: StatusBadgeProps) {
  const statusUpper = (status || "NEEDS_VERIFICATION").toUpperCase();

  const styles: Record<string, { label: string; style: string }> = {
    CONFIRMED_AFFECTED: {
      label: "Confirmed Affected",
      style: "bg-red-500/20 text-red-300 border-red-500/40",
    },
    POTENTIALLY_AFFECTED: {
      label: "Potentially Affected",
      style: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
    VERIFIED_FIXED: {
      label: "Verified Fixed",
      style: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    },
    NEEDS_VERIFICATION: {
      label: "Needs Verification",
      style: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
    RISK_ACCEPTED: {
      label: "Risk Accepted",
      style: "bg-slate-800 text-slate-300 border-slate-700",
    },
  };

  const current = styles[statusUpper] || styles.NEEDS_VERIFICATION;

  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-semibold px-2 py-0.5 ${current.style} ${className}`}
    >
      {current.label}
    </Badge>
  );
}
