import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
    label: string;
  };
  highlightColor?: "teal" | "blue" | "amber" | "red" | "purple";
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  highlightColor = "teal",
  className,
}: StatCardProps) {
  const colorMap = {
    teal: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-slate-700/80",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-slate-400 tracking-tight">
          {title}
        </span>
        <div className={cn("flex items-center justify-center w-9 h-9 rounded-lg border", colorMap[highlightColor])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white">
          {value}
        </span>
      </div>

      {(description || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          {description && <span>{description}</span>}
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                trend.direction === "up" && "text-emerald-400",
                trend.direction === "down" && "text-rose-400",
                trend.direction === "neutral" && "text-slate-400"
              )}
            >
              {trend.direction === "up" && <TrendingUp className="w-3 h-3" />}
              {trend.direction === "down" && <TrendingDown className="w-3 h-3" />}
              {trend.direction === "neutral" && <Minus className="w-3 h-3" />}
              <span>{trend.value}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
