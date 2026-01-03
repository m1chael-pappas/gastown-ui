import { NextRequest, NextResponse } from "next/server";
import { getAllBeads } from "@/lib/beads";
import { createConvoy } from "@/lib/gastown";
import { Convoy, Bead } from "@/types/gastown";

// Convert convoy beads to Convoy type
function beadToConvoy(bead: Bead, allBeads: Bead[]): Convoy {
  // Get tracked beads from dependencies
  const trackedIds = bead.dependencies?.map((d) => d.depends_on_id) || bead.depends_on || [];
  const trackedBeads = trackedIds
    .map((id) => allBeads.find((b) => b.id === id))
    .filter((b): b is Bead => b !== undefined);

  const completedCount = trackedBeads.filter((b) => b.status === "closed").length;
  const totalCount = trackedBeads.length;

  return {
    id: bead.id,
    name: bead.title,
    status: bead.status === "closed" ? "completed" : totalCount > 0 && completedCount === totalCount ? "completed" : "active",
    beads: trackedIds,
    progress: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
    created_at: bead.created_at,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  try {
    // Get all beads and filter for convoy type
    const allBeads = getAllBeads();
    const convoyBeads = allBeads.filter((b) => b.issue_type === "convoy");
    const convoys = convoyBeads.map((b) => beadToConvoy(b, allBeads));

    if (id) {
      const convoy = convoys.find((c) => c.id === id);
      if (!convoy) {
        return NextResponse.json(
          { error: "Convoy not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ convoy });
    }

    return NextResponse.json({ convoys });
  } catch {
    return NextResponse.json({ convoys: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, beadIds, notify, humanRequired } = body;

    if (!name || !beadIds || beadIds.length === 0) {
      return NextResponse.json(
        { error: "name and beadIds are required" },
        { status: 400 }
      );
    }

    const convoy = createConvoy(name, beadIds, { notify, humanRequired });

    if (!convoy) {
      return NextResponse.json(
        { error: "Failed to create convoy" },
        { status: 500 }
      );
    }

    return NextResponse.json({ convoy }, { status: 201 });
  } catch (error) {
    console.error("Failed to create convoy:", error);
    return NextResponse.json(
      { error: "Failed to create convoy" },
      { status: 500 }
    );
  }
}
