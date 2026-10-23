import React from "react";
import {
  KeyRound,
  Laptop,
  Wifi,
  Mail,
  Database,
  Code2,
  Cloud,
  Building2,
  ShieldAlert,
} from "lucide-react";
import { THREAT_CATEGORY_CONFIG, type ThreatCategory } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ThreatCategoryBadgeProps {
  category: ThreatCategory | string;
  className?: string;
  showIcon?: boolean;
}

export function ThreatCategoryBadge({
  category,
  className,
  showIcon = true,
}: ThreatCategoryBadgeProps) {
  const normCategory = (category?.toUpperCase() || "OTHER") as ThreatCategory;
  const config = THREAT_CATEGORY_CONFIG[normCategory] || THREAT_CATEGORY_CONFIG.OTHER;

  const renderIcon = () => {
    switch (config.icon) {
      case "KeyRound":
        return <KeyRound className="w-3.5 h-3.5" />;
      case "Laptop":
        return <Laptop className="w-3.5 h-3.5" />;
      case "Wifi":
        return <Wifi className="w-3.5 h-3.5" />;
      case "Mail":
        return <Mail className="w-3.5 h-3.5" />;
      case "Database":
        return <Database className="w-3.5 h-3.5" />;
      case "Code2":
        return <Code2 className="w-3.5 h-3.5" />;
      case "Cloud":
        return <Cloud className="w-3.5 h-3.5" />;
      case "Building2":
        return <Building2 className="w-3.5 h-3.5" />;
      default:
        return <ShieldAlert className="w-3.5 h-3.5" />;
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/80",
        className
      )}
    >
      {showIcon && renderIcon()}
      <span>{config.label}</span>
    </span>
  );
}
