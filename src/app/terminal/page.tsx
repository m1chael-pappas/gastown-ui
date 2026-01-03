"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Terminal, Trash2, AlertTriangle, Key } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export default function MayorChatPage() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "Connected to Gas Town Mayor. Type a message to coordinate work across your rigs.",
      timestamp: new Date(),
    },
  ]);

  useEffect(() => {
    // Check if API key is configured
    fetch("/api/mayor/status")
      .then((res) => res.json())
      .then((data) => setHasApiKey(data.hasApiKey))
      .catch(() => setHasApiKey(false));
  }, []);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/mayor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.error || "No response from Mayor",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Failed to reach Mayor"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "system",
        content: "Chat cleared. Ready for new commands.",
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* API Key Warning */}
      {hasApiKey === false && (
        <div className="flex items-center gap-3 border-b border-amber-500/30 bg-amber-500/10 px-6 py-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-200">
              Anthropic API Key Required
            </p>
            <p className="text-xs text-amber-300/70">
              Add <code className="rounded bg-amber-500/20 px-1">ANTHROPIC_API_KEY</code> to your{" "}
              <code className="rounded bg-amber-500/20 px-1">.env.local</code> file to enable AI-powered chat.
              Currently running in command-only mode.
            </p>
          </div>
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-amber-400"
          >
            <Key className="h-3 w-3" />
            Get API Key
          </a>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
            <Terminal className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Mayor Chat</h1>
            <p className="text-sm text-zinc-400">
              {hasApiKey ? "AI-powered coordination" : "Command mode (add API key for AI chat)"}
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role !== "user" && (
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  message.role === "system"
                    ? "bg-zinc-800"
                    : "bg-amber-500/20"
                }`}
              >
                <Bot
                  className={`h-4 w-4 ${
                    message.role === "system" ? "text-zinc-400" : "text-amber-500"
                  }`}
                />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : message.role === "system"
                  ? "bg-zinc-800/50 text-zinc-400 italic"
                  : "bg-zinc-800 text-zinc-100"
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {message.content}
              </pre>
              <div
                className={`mt-1 text-xs ${
                  message.role === "user" ? "text-blue-200" : "text-zinc-500"
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
            {message.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
              <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
            </div>
            <div className="rounded-lg bg-zinc-800 px-4 py-3">
              <span className="text-sm text-zinc-400">Mayor is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Commands */}
      <div className="border-t border-zinc-800 px-6 py-3">
        <div className="flex flex-wrap gap-2">
          <QuickCommand cmd="list convoys" onClick={(cmd) => setInput(cmd)} />
          <QuickCommand cmd="show agents" onClick={(cmd) => setInput(cmd)} />
          <QuickCommand cmd="list beads" onClick={(cmd) => setInput(cmd)} />
          <QuickCommand cmd="what needs attention?" onClick={(cmd) => setInput(cmd)} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800 p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message to the Mayor..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center rounded-lg bg-amber-500 px-4 py-3 text-zinc-900 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <div className="mt-2 text-xs text-zinc-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}

function QuickCommand({ cmd, onClick }: { cmd: string; onClick: (cmd: string) => void }) {
  return (
    <button
      onClick={() => onClick(cmd)}
      className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
    >
      {cmd}
    </button>
  );
}
