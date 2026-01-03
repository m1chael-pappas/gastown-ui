"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { RefreshCw, Terminal as TerminalIcon, Info } from "lucide-react";

// Dynamic import to avoid SSR issues with xterm
const Terminal = dynamic(
  () => import("@/components/terminal").then((mod) => mod.Terminal),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    ),
  }
);

export default function TerminalPage() {
  return (
    <div className="flex h-[calc(100vh-48px)] flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Terminal</h1>
          <p className="text-sm text-zinc-400">
            Full terminal access to Gas Town
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
          <Info className="h-4 w-4 text-zinc-500" />
          <span className="text-xs text-zinc-500">
            Run <code className="rounded bg-zinc-800 px-1">pnpm terminal</code> to
            start the terminal server
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border border-zinc-800">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center bg-zinc-900">
              <RefreshCw className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          }
        >
          <Terminal />
        </Suspense>
      </div>

      {/* Quick Commands */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <h3 className="mb-3 text-sm font-medium text-zinc-400">
          Quick Commands
        </h3>
        <div className="flex flex-wrap gap-2">
          <QuickCommand cmd="gt status" desc="Town status" />
          <QuickCommand cmd="gt convoy list" desc="List convoys" />
          <QuickCommand cmd="gt agents" desc="View agents" />
          <QuickCommand cmd="gt prime" desc="Start Mayor session" />
          <QuickCommand cmd="bd list" desc="List beads" />
          <QuickCommand cmd="bd ready" desc="Actionable beads" />
        </div>
      </div>
    </div>
  );
}

function QuickCommand({ cmd, desc }: { cmd: string; desc: string }) {
  return (
    <div className="group flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5">
      <code className="text-sm text-zinc-300">{cmd}</code>
      <span className="text-xs text-zinc-500">- {desc}</span>
    </div>
  );
}
