import { NextRequest, NextResponse } from "next/server";
import { getAllBeads } from "@/lib/beads";
import { triggerHandoff, spawnPolecat } from "@/lib/gastown";
import { Agent, Bead } from "@/types/gastown";

// Convert agent beads to Agent type
function beadToAgent(bead: Bead): Agent {
  // Parse agent info from description
  const desc = bead.description || "";
  const roleMatch = desc.match(/role_type:\s*(\w+)/);
  const rigMatch = desc.match(/rig:\s*(\w+)/);
  const stateMatch = desc.match(/agent_state:\s*(\w+)/);

  return {
    id: bead.id,
    role: (roleMatch?.[1] || "polecat") as Agent["role"],
    rig: rigMatch?.[1] === "null" ? undefined : rigMatch?.[1],
    status: stateMatch?.[1] === "running" ? "working" : "idle",
    started_at: bead.created_at,
    current_task: bead.title !== bead.id ? bead.title : undefined,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  try {
    // Get all beads and filter for agent type
    const allBeads = getAllBeads();
    const agentBeads = allBeads.filter((b) => b.issue_type === "agent");
    const agents = agentBeads.map(beadToAgent);

    if (id) {
      const agent = agents.find((a) => a.id === id);
      if (!agent) {
        return NextResponse.json(
          { error: "Agent not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ agent });
    }

    return NextResponse.json({ agents });
  } catch {
    return NextResponse.json({ agents: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, agentId, rig, beadId } = body;

    if (action === "handoff") {
      if (!agentId) {
        return NextResponse.json(
          { error: "agentId is required for handoff" },
          { status: 400 }
        );
      }
      const success = triggerHandoff(agentId);
      return NextResponse.json({ success });
    }

    if (action === "spawn") {
      if (!rig) {
        return NextResponse.json(
          { error: "rig is required for spawn" },
          { status: 400 }
        );
      }
      const result = spawnPolecat(rig, beadId);
      return NextResponse.json({ success: !!result, result });
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Agent action failed:", error);
    return NextResponse.json(
      { error: "Action failed" },
      { status: 500 }
    );
  }
}
