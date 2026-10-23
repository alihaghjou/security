import React from "react";
import { INCIDENT_STATUS_CONFIG, type IncidentStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: IncidentStatus | string;
  useUserLabel?: boolean;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  useUserLabel = false,
  className,
  showDot = true,
}: StatusBadgeProps) {
  const normStatus = (status?.toUpperCase() || "DETECTED") as IncidentStatus;
  const config = INCIDENT_STATUS_CONFIG[normStatus] || INCIDENT_STATUS_CONFIG.DETECTED;
  const text = useUserLabel ? config.userLabel : config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.badgeClass,
        className
      )}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {["DETECTED", "INVESTIGATING"].includes(normStatus) && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          )}
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      <span>{text}</span>
    </span>
  );
}
