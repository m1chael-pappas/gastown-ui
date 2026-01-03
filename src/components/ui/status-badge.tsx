import { cn, getStatusColor, getStatusBgColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const displayStatus = status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        getStatusColor(status),
        getStatusBgColor(status),
        className
      )}
    >
      {displayStatus}
    </span>
  );
}
