import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    open: "text-blue-500",
    in_progress: "text-yellow-500",
    blocked: "text-red-500",
    closed: "text-green-500",
    ready: "text-emerald-500",
    active: "text-green-500",
    completed: "text-green-500",
    paused: "text-gray-500",
    failed: "text-red-500",
    idle: "text-gray-500",
    working: "text-yellow-500",
    stuck: "text-red-500",
    handoff_requested: "text-orange-500",
    offline: "text-gray-400",
  };
  return colors[status] || "text-gray-500";
}

export function getStatusBgColor(status: string): string {
  const colors: Record<string, string> = {
    open: "bg-blue-500/10",
    in_progress: "bg-yellow-500/10",
    blocked: "bg-red-500/10",
    closed: "bg-green-500/10",
    ready: "bg-emerald-500/10",
    active: "bg-green-500/10",
    completed: "bg-green-500/10",
    paused: "bg-gray-500/10",
    failed: "bg-red-500/10",
    idle: "bg-gray-500/10",
    working: "bg-yellow-500/10",
    stuck: "bg-red-500/10",
    handoff_requested: "bg-orange-500/10",
    offline: "bg-gray-400/10",
  };
  return colors[status] || "bg-gray-500/10";
}

export function getPriorityLabel(priority: number): string {
  const labels: Record<number, string> = {
    0: "Critical",
    1: "High",
    2: "Medium",
    3: "Low",
  };
  return labels[priority] ?? `P${priority}`;
}

export function getRoleIcon(role: string): string {
  const icons: Record<string, string> = {
    mayor: "Crown",
    witness: "Eye",
    refinery: "GitMerge",
    polecat: "Wrench",
    crew: "Users",
    deacon: "Server",
  };
  return icons[role] || "User";
}
