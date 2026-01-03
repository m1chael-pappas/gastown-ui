"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";

interface TerminalProps {
  wsUrl?: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function Terminal({
  wsUrl = "ws://localhost:3001",
  onConnected,
  onDisconnected,
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setError(null);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      onConnected?.();
      xtermRef.current?.writeln("\x1b[32mConnected to terminal server.\x1b[0m");
      xtermRef.current?.writeln("");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case "output":
            xtermRef.current?.write(msg.data);
            break;
          case "connected":
            xtermRef.current?.writeln(`\x1b[90m${msg.message}\x1b[0m`);
            break;
          case "exit":
            xtermRef.current?.writeln(
              `\x1b[33mProcess exited with code ${msg.code}\x1b[0m`
            );
            break;
        }
      } catch {
        // Raw output
        xtermRef.current?.write(event.data);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      onDisconnected?.();
      xtermRef.current?.writeln("");
      xtermRef.current?.writeln("\x1b[31mDisconnected from terminal server.\x1b[0m");
    };

    ws.onerror = () => {
      setError("Failed to connect to terminal server. Make sure it's running.");
      setIsConnected(false);
    };
  }, [wsUrl, onConnected, onDisconnected]);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: "block",
      fontFamily: '"Geist Mono", "JetBrains Mono", "Fira Code", monospace',
      fontSize: 14,
      lineHeight: 1.2,
      theme: {
        background: "#09090b",
        foreground: "#fafafa",
        cursor: "#fafafa",
        cursorAccent: "#09090b",
        selectionBackground: "#3f3f46",
        black: "#18181b",
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#eab308",
        blue: "#3b82f6",
        magenta: "#a855f7",
        cyan: "#06b6d4",
        white: "#fafafa",
        brightBlack: "#71717a",
        brightRed: "#f87171",
        brightGreen: "#4ade80",
        brightYellow: "#facc15",
        brightBlue: "#60a5fa",
        brightMagenta: "#c084fc",
        brightCyan: "#22d3ee",
        brightWhite: "#ffffff",
      },
    });

    xtermRef.current = term;

    // Add fit addon
    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);

    // Add web links addon
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(webLinksAddon);

    // Open terminal
    term.open(terminalRef.current);
    fitAddon.fit();

    // Handle input
    term.onData((data) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "input", data }));
      }
    });

    // Handle resize
    term.onResize(({ cols, rows }) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "resize", cols, rows }));
      }
    });

    // Welcome message
    term.writeln("\x1b[1;36m╔════════════════════════════════════════════════════════════╗\x1b[0m");
    term.writeln("\x1b[1;36m║              Gas Town Web Terminal                         ║\x1b[0m");
    term.writeln("\x1b[1;36m╚════════════════════════════════════════════════════════════╝\x1b[0m");
    term.writeln("");
    term.writeln("\x1b[90mConnecting to terminal server...\x1b[0m");
    term.writeln("");

    // Connect to WebSocket
    connect();

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      wsRef.current?.close();
      term.dispose();
    };
  }, [connect]);

  const handleReconnect = () => {
    wsRef.current?.close();
    connect();
  };

  const sendCommand = (command: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "command", command }));
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-zinc-400">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          {error && <span className="text-sm text-red-400">{error}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => sendCommand("gt-prime")}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
          >
            gt prime
          </button>
          <button
            onClick={() => sendCommand("clear")}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Clear
          </button>
          {!isConnected && (
            <button
              onClick={handleReconnect}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Reconnect
            </button>
          )}
        </div>
      </div>

      {/* Terminal */}
      <div
        ref={terminalRef}
        className="flex-1 bg-[#09090b] p-2"
        style={{ minHeight: 0 }}
      />
    </div>
  );
}
