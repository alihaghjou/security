import React from "react";
import { Badge } from "@/components/ui/badge";

export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";

interface SeverityBadgeProps {
  severity: SeverityLevel | string;
  className?: string;
}

export function SeverityBadge({ severity, className = "" }: SeverityBadgeProps) {
  const sevUpper = (severity || "LOW").toUpperCase();

  const styles: Record<string, string> = {
    CRITICAL: "bg-red-500/20 text-red-300 border-red-500/40",
    HIGH: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    MEDIUM: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    LOW: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    INFORMATIONAL: "bg-slate-800 text-slate-300 border-slate-700",
  };

  const currentStyle = styles[sevUpper] || styles.LOW;

  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 ${currentStyle} ${className}`}
    >
      {sevUpper}
    </Badge>
  );
}
