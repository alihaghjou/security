import React from "react";
import { formatDistanceToNow, format } from "date-fns";
import {
  ShieldAlert,
  Search,
  UserCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  FileText,
  Lock,
} from "lucide-react";
import { StatusBadge } from "./status-badge";
import { cn } from "@/lib/utils";

export interface TimelineEntry {
  id: string;
  timestamp: string | Date;
  actorName: string;
  action: string;
  description: string;
  statusFrom?: string | null;
  statusTo?: string | null;
  isVisibleToUser?: boolean;
  metadata?: Record<string, unknown> | null;
}

interface IncidentTimelineProps {
  events: TimelineEntry[];
  isTechnicianView?: boolean;
  className?: string;
}

export function IncidentTimeline({
  events = [],
  isTechnicianView = false,
  className,
}: IncidentTimelineProps) {
  // Filter for everyday user if not technician view
  const displayEvents = isTechnicianView
    ? events
    : events.filter((e) => e.isVisibleToUser !== false);

  if (displayEvents.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-500">
        No timeline events recorded yet.
      </div>
    );
  }

  const getEventIcon = (action: string, statusTo?: string | null) => {
    const act = (action || "").toLowerCase();
    const st = (statusTo || "").toLowerCase();

    if (st.includes("resolved") || act.includes("resolved") || act.includes("contained")) {
      return <CheckCircle className="w-4 h-4 text-teal-400" />;
    }
    if (st.includes("investigat") || act.includes("investigat")) {
      return <Search className="w-4 h-4 text-amber-400" />;
    }
    if (act.includes("assign") || act.includes("acknowledged")) {
      return <UserCheck className="w-4 h-4 text-sky-400" />;
    }
    if (act.includes("escalat")) {
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
    if (act.includes("note") || act.includes("message")) {
      return <FileText className="w-4 h-4 text-indigo-400" />;
    }
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className={cn("relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800", className)}>
      {displayEvents.map((event, idx) => {
        const dateObj = new Date(event.timestamp);
        const timeAgo = formatDistanceToNow(dateObj, { addSuffix: true });
        const exactTime = format(dateObj, "MMM d, yyyy · HH:mm:ss");

        return (
          <div key={event.id || idx} className="relative group">
            {/* Circle dot on timeline line */}
            <div className="absolute -left-6 top-1 flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 border border-slate-700 ring-4 ring-slate-950 group-hover:border-teal-400 transition-colors">
              {getEventIcon(event.action, event.statusTo)}
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all hover:border-slate-700/80 hover:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-100">
                    {event.action}
                  </span>
                  {event.statusTo && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      {event.statusFrom && (
                        <>
                          <span className="text-slate-500">{event.statusFrom}</span>
                          <ArrowRight className="w-3 h-3 text-slate-600" />
                        </>
                      )}
                      <StatusBadge status={event.statusTo} showDot={false} />
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-400" title={exactTime}>
                  {timeAgo}
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {event.description}
              </p>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  Responsible Actor: <span className="text-slate-300 font-medium">{event.actorName || "Automated Guard"}</span>
                </span>
                {isTechnicianView && event.isVisibleToUser === false && (
                  <span className="flex items-center gap-1 text-[11px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded">
                    <Lock className="w-3 h-3" /> Internal Technician Only
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
