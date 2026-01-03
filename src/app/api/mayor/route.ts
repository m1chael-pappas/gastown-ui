import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import { join } from "path";

// Get project bin directory
const getProjectRoot = () => {
  const candidates = [
    process.cwd(),
    join(process.cwd(), ".."),
    "/home/michael_pappas/Documents/Personal/code/gastown-ui",
  ];

  for (const candidate of candidates) {
    try {
      const binPath = join(candidate, "bin", "gt");
      require("fs").accessSync(binPath);
      return candidate;
    } catch {
      continue;
    }
  }
  return process.cwd();
};

const projectRoot = getProjectRoot();
const binDir = join(projectRoot, "bin");
const gastownPath = process.env.GASTOWN_PATH || join(process.env.HOME || "", "gt");

function runCommand(command: string): string {
  try {
    return execSync(command, {
      encoding: "utf-8",
      timeout: 10000,
      env: {
        ...process.env,
        PATH: `${binDir}:${process.env.PATH}`,
        GASTOWN_PATH: gastownPath,
      },
      cwd: gastownPath,
    }).trim();
  } catch (error: unknown) {
    const err = error as { stderr?: string; message?: string };
    throw new Error(err.stderr || err.message || "Command failed");
  }
}

// Parse natural language commands into gt/bd commands
function parseCommand(message: string): { command: string; description: string } | null {
  const msg = message.toLowerCase().trim();

  // Convoy commands
  if (msg.includes("list convoy") || msg.includes("show convoy") || msg === "convoys") {
    return { command: "gt convoy list", description: "Listing convoys" };
  }
  if (msg.match(/convoy status\s+(\S+)/)) {
    const match = msg.match(/convoy status\s+(\S+)/);
    return { command: `gt convoy status ${match![1]}`, description: `Getting status for convoy ${match![1]}` };
  }

  // Agent commands
  if (msg.includes("list agent") || msg.includes("show agent") || msg === "agents") {
    return { command: "gt agents list", description: "Listing agents" };
  }

  // Bead commands
  if (msg.includes("list bead") || msg.includes("show bead") || msg === "beads") {
    return { command: "bd list", description: "Listing beads" };
  }
  if (msg.includes("ready") || msg.includes("actionable")) {
    return { command: "bd ready", description: "Showing actionable beads" };
  }

  // Rig commands
  if (msg.includes("list rig") || msg.includes("show rig") || msg === "rigs") {
    return { command: "gt rig list", description: "Listing rigs" };
  }

  // Status commands
  if (msg.includes("status") || msg.includes("health") || msg.includes("doctor")) {
    return { command: "gt doctor", description: "Running health check" };
  }

  // Help
  if (msg.includes("help") || msg.includes("what can")) {
    return {
      command: "echo",
      description: `I can help you with:
• list convoys - Show all convoy tracking units
• list agents - Show running agent sessions
• list beads - Show work items
• show actionable - Show beads ready for work
• list rigs - Show managed repositories
• status - Run health check
• convoy status <id> - Get specific convoy details

You can also run any gt or bd command directly.`
    };
  }

  // Direct gt/bd commands
  if (msg.startsWith("gt ") || msg.startsWith("bd ")) {
    return { command: msg, description: `Running: ${msg}` };
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const parsed = parseCommand(message);

    if (!parsed) {
      return NextResponse.json({
        response: `I'm not sure how to handle that request. Try:
• "list convoys" - Show convoy tracking
• "list agents" - Show agent sessions
• "list beads" - Show work items
• "help" - See all available commands

Or run a gt/bd command directly like "gt convoy list" or "bd ready".`,
      });
    }

    // Handle help specially
    if (parsed.command === "echo") {
      return NextResponse.json({ response: parsed.description });
    }

    try {
      const output = runCommand(parsed.command);
      return NextResponse.json({
        response: output || `${parsed.description}\n\n(No output)`,
      });
    } catch (error) {
      return NextResponse.json({
        response: `${parsed.description}\n\nError: ${error instanceof Error ? error.message : "Command failed"}`,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 500 }
    );
  }
}
