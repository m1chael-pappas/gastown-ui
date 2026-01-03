import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-800 bg-zinc-900/50 p-4",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="rounded-md bg-zinc-800 p-2">
            <Icon className="h-5 w-5 text-zinc-400" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={cn(
              "text-xs font-medium",
              trend.value >= 0 ? "text-green-500" : "text-red-500"
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-xs text-zinc-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
