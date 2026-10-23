import React from "react";
import { AlertOctagon, AlertTriangle, AlertCircle, Info, ShieldAlert } from "lucide-react";
import { SEVERITY_CONFIG, type IncidentSeverity } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: IncidentSeverity | string;
  useUserLabel?: boolean;
  className?: string;
}

export function SeverityBadge({
  severity,
  useUserLabel = false,
  className,
}: SeverityBadgeProps) {
  const normSeverity = (severity?.toUpperCase() || "INFORMATIONAL") as IncidentSeverity;
  const config = SEVERITY_CONFIG[normSeverity] || SEVERITY_CONFIG.INFORMATIONAL;

  const IconComponent = () => {
    switch (config.icon) {
      case "AlertOctagon":
        return <AlertOctagon className="w-3.5 h-3.5" />;
      case "AlertTriangle":
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case "AlertCircle":
        return <AlertCircle className="w-3.5 h-3.5" />;
      case "Info":
        return <Info className="w-3.5 h-3.5" />;
      default:
        return <ShieldAlert className="w-3.5 h-3.5" />;
    }
  };

  const text = useUserLabel ? config.userLabel : config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm",
        config.badgeClass,
        className
      )}
    >
      <IconComponent />
      <span>{text}</span>
    </span>
  );
}
