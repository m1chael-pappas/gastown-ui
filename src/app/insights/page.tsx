"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  RefreshCw,
  AlertTriangle,
  Building2,
  Satellite,
  BookOpen,
  Activity,
  TrendingUp,
  Download,
} from "lucide-react";
import { Insights, InsightMetric } from "@/types/gastown";

async function fetchInsights() {
  const res = await fetch("/api/insights");
  return res.json();
}

export default function InsightsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["insights"],
    queryFn: fetchInsights,
  });

  const insights: Insights | null = data?.insights || null;

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
          <h1 className="text-2xl font-bold text-zinc-100">Insights</h1>
          <p className="text-sm text-zinc-400">
            Graph analytics and work intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {!insights ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-zinc-600" />
          <h3 className="mt-4 text-lg font-medium text-zinc-300">
            No insights available
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            Run <code className="rounded bg-zinc-800 px-1">bv --robot-insights</code>{" "}
            to generate graph analytics.
          </p>
        </div>
      ) : (
        <>
          {/* Top Row - Key Metrics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InsightCard
              title="Bottlenecks"
              subtitle="High betweenness centrality"
              icon={AlertTriangle}
              iconColor="text-red-500 bg-red-500/10"
              metrics={insights.bottlenecks}
            />
            <InsightCard
              title="Keystones"
              subtitle="Critical path items"
              icon={Building2}
              iconColor="text-amber-500 bg-amber-500/10"
              metrics={insights.keystones}
            />
            <InsightCard
              title="Hubs"
              subtitle="Aggregator nodes"
              icon={Satellite}
              iconColor="text-blue-500 bg-blue-500/10"
              metrics={insights.hubs}
            />
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InsightCard
              title="Authorities"
              subtitle="Highly depended-on items"
              icon={BookOpen}
              iconColor="text-purple-500 bg-purple-500/10"
              metrics={insights.authorities}
            />

            {/* Cycles */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100">Cycles</h3>
                  <p className="text-xs text-zinc-500">Circular dependencies</p>
                </div>
              </div>
              {insights.cycles.length === 0 ? (
                <p className="text-sm text-green-500">No cycles detected</p>
              ) : (
                <div className="space-y-2">
                  {insights.cycles.map((cycle, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-orange-500/10 p-2 text-xs text-orange-400"
                    >
                      {cycle.join(" → ")} → {cycle[0]}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Health */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2 text-green-500">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100">Health</h3>
                  <p className="text-xs text-zinc-500">Graph metrics</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Density</span>
                  <span className="font-mono text-sm text-zinc-100">
                    {insights.health.density.toFixed(3)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Velocity</span>
                  <span className="flex items-center gap-1 font-mono text-sm text-green-500">
                    <TrendingUp className="h-3 w-3" />+{insights.health.velocity}/week
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InsightCard({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  metrics,
}: {
  title: string;
  subtitle: string;
  icon: typeof AlertTriangle;
  iconColor: string;
  metrics: InsightMetric[];
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className={`rounded-lg p-2 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-zinc-100">{title}</h3>
          <p className="text-xs text-zinc-500">{subtitle}</p>
        </div>
      </div>
      {metrics.length === 0 ? (
        <p className="text-sm text-zinc-500">No data</p>
      ) : (
        <div className="space-y-2">
          {metrics.slice(0, 5).map((metric) => (
            <div key={metric.id} className="flex items-center justify-between">
              <span className="truncate text-sm text-zinc-300">{metric.id}</span>
              <span className="shrink-0 font-mono text-sm text-zinc-400">
                {metric.score.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
