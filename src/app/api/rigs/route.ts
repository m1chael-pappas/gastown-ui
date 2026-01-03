import { NextResponse } from "next/server";
import { getAvailableRigs } from "@/lib/beads";

export async function GET() {
  try {
    const rigs = getAvailableRigs();
    return NextResponse.json({ rigs });
  } catch {
    return NextResponse.json({ rigs: [] });
  }
}
