"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CircleDot,
  Plus,
  RefreshCw,
  Filter,
  Bug,
  Lightbulb,
  CheckSquare,
  Layers,
  Wrench,
  AlertCircle,
  Clock,
  CheckCircle2,
  GitBranch,
} from "lucide-react";
import { StatusBadge } from "@/components/ui";
import { Bead, BeadStatus, BeadType } from "@/types/gastown";
import { cn, formatRelativeTime, getPriorityLabel } from "@/lib/utils";
import Link from "next/link";

const TYPE_ICONS: Record<BeadType, typeof Bug> = {
  bug: Bug,
  feature: Lightbulb,
  task: CheckSquare,
  epic: Layers,
  chore: Wrench,
};

const STATUS_OPTIONS: BeadStatus[] = [
  "open",
  "in_progress",
  "blocked",
  "ready",
  "closed",
];

async function fetchBeads(status?: string) {
  const url = status ? `/api/beads?status=${status}` : "/api/beads";
  const res = await fetch(url);
  return res.json();
}

export default function BeadsPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["beads", statusFilter],
    queryFn: () => fetchBeads(statusFilter || undefined),
  });

  const beads: Bead[] = data?.beads || [];

  // Group by status for Kanban-style view
  const beadsByStatus = beads.reduce((acc, bead) => {
    if (!acc[bead.status]) acc[bead.status] = [];
    acc[bead.status].push(bead);
    return acc;
  }, {} as Record<BeadStatus, Bead[]>);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Beads</h1>
          <p className="text-sm text-zinc-400">
            Browse and manage work items
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Create Bead
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setStatusFilter(null)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            !statusFilter
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-100"
          )}
        >
          All ({beads.length})
        </button>
        {STATUS_OPTIONS.map((status) => {
          const count = beadsByStatus[status]?.length || 0;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                statusFilter === status
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-100"
              )}
            >
              {status.replace("_", " ")} ({count})
            </button>
          );
        })}
      </div>

      {/* Beads List */}
      {beads.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <CircleDot className="mx-auto h-12 w-12 text-zinc-600" />
          <h3 className="mt-4 text-lg font-medium text-zinc-300">
            No beads found
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            {statusFilter
              ? `No beads with status "${statusFilter}". Try a different filter.`
              : "Create your first bead to start tracking work."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {beads.map((bead) => (
            <BeadRow key={bead.id} bead={bead} />
          ))}
        </div>
      )}
    </div>
  );
}

function BeadRow({ bead }: { bead: Bead }) {
  const TypeIcon = bead.type ? TYPE_ICONS[bead.type] : CircleDot;

  return (
    <div className="group flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          bead.type === "bug"
            ? "bg-red-500/10 text-red-500"
            : bead.type === "feature"
            ? "bg-purple-500/10 text-purple-500"
            : "bg-zinc-500/10 text-zinc-500"
        )}
      >
        <TypeIcon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs text-zinc-500">{bead.id}</span>
          <h3 className="truncate font-medium text-zinc-100">{bead.title}</h3>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
          {bead.priority !== undefined && (
            <span
              className={cn(
                "font-medium",
                bead.priority === 0
                  ? "text-red-500"
                  : bead.priority === 1
                  ? "text-orange-500"
                  : ""
              )}
            >
              {getPriorityLabel(bead.priority)}
            </span>
          )}
          {bead.assignee && <span>→ {bead.assignee}</span>}
          {bead.created_at && <span>{formatRelativeTime(bead.created_at)}</span>}
          {bead.depends_on && bead.depends_on.length > 0 && (
            <span className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {bead.depends_on.length} deps
            </span>
          )}
          {bead.blocks && bead.blocks.length > 0 && (
            <span className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              blocks {bead.blocks.length}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {bead.labels && bead.labels.length > 0 && (
          <div className="flex gap-1">
            {bead.labels.slice(0, 2).map((label) => (
              <span
                key={label}
                className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
              >
                {label}
              </span>
            ))}
            {bead.labels.length > 2 && (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                +{bead.labels.length - 2}
              </span>
            )}
          </div>
        )}
        <StatusBadge status={bead.status} />
      </div>
    </div>
  );
}
