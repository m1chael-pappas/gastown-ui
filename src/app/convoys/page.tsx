"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Truck,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pause,
  Eye,
  GitBranch,
} from "lucide-react";
import { ProgressBar, StatusBadge } from "@/components/ui";
import { Convoy, Bead } from "@/types/gastown";
import { cn, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

async function fetchConvoys() {
  const res = await fetch("/api/convoys");
  return res.json();
}

async function fetchBeads() {
  const res = await fetch("/api/beads");
  return res.json();
}

export default function ConvoysPage() {
  const { data: convoysData, isLoading: loadingConvoys } = useQuery({
    queryKey: ["convoys"],
    queryFn: fetchConvoys,
  });

  const { data: beadsData } = useQuery({
    queryKey: ["beads"],
    queryFn: fetchBeads,
  });

  const convoys: Convoy[] = convoysData?.convoys || [];
  const beads: Bead[] = beadsData?.beads || [];

  const beadsMap = new Map(beads.map((b) => [b.id, b]));

  if (loadingConvoys) {
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
          <h1 className="text-2xl font-bold text-zinc-100">Convoys</h1>
          <p className="text-sm text-zinc-400">
            Track and manage grouped work packages
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Create Convoy
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-400">Total Convoys</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">
            {convoys.length}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-400">Active</p>
          <p className="mt-1 text-2xl font-bold text-green-500">
            {convoys.filter((c) => c.status === "active").length}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-400">Completed</p>
          <p className="mt-1 text-2xl font-bold text-blue-500">
            {convoys.filter((c) => c.status === "completed").length}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-400">Paused</p>
          <p className="mt-1 text-2xl font-bold text-zinc-500">
            {convoys.filter((c) => c.status === "paused").length}
          </p>
        </div>
      </div>

      {/* Convoy List */}
      {convoys.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <Truck className="mx-auto h-12 w-12 text-zinc-600" />
          <h3 className="mt-4 text-lg font-medium text-zinc-300">
            No convoys yet
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            Create a convoy to track multiple related beads together.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {convoys.map((convoy) => {
            const convoyBeads = convoy.beads.map((id) => beadsMap.get(id)).filter(Boolean) as Bead[];
            const completedCount = convoyBeads.filter((b) => b.status === "closed").length;
            const progress = convoyBeads.length > 0 ? (completedCount / convoyBeads.length) * 100 : 0;

            return (
              <div
                key={convoy.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-lg",
                        convoy.status === "active"
                          ? "bg-green-500/10 text-green-500"
                          : convoy.status === "completed"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-zinc-500/10 text-zinc-500"
                      )}
                    >
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-zinc-100">
                          {convoy.name}
                        </h3>
                        <StatusBadge status={convoy.status} />
                        {convoy.human_required && (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-500">
                            Human Review
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500">
                        {convoy.id} • Created {formatRelativeTime(convoy.created_at)}
                      </p>
                      {convoy.description && (
                        <p className="mt-1 text-sm text-zinc-400">
                          {convoy.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/graph?convoy=${convoy.id}`}
                      className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                      title="View Dependency Graph"
                    >
                      <GitBranch className="h-4 w-4" />
                    </Link>
                    <button
                      className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {convoy.status === "active" && (
                      <button
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                        title="Pause Convoy"
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <ProgressBar
                    value={progress}
                    label={`Progress (${completedCount}/${convoyBeads.length} tasks)`}
                    variant={progress === 100 ? "success" : "default"}
                  />
                </div>

                {/* Bead Preview */}
                <div className="mt-4 space-y-2">
                  {convoyBeads.slice(0, 5).map((bead) => (
                    <div
                      key={bead.id}
                      className="flex items-center gap-3 rounded-lg bg-zinc-800/50 p-2"
                    >
                      {bead.status === "closed" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : bead.status === "in_progress" ? (
                        <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />
                      ) : bead.status === "blocked" ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-zinc-500" />
                      )}
                      <span className="text-sm text-zinc-300">{bead.title}</span>
                      <span className="ml-auto text-xs text-zinc-500">
                        {bead.assignee || "unassigned"}
                      </span>
                    </div>
                  ))}
                  {convoyBeads.length > 5 && (
                    <p className="text-center text-xs text-zinc-500">
                      +{convoyBeads.length - 5} more tasks
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
