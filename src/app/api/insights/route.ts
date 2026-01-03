import { NextRequest, NextResponse } from "next/server";
import { getInsights, getExecutionPlan, getPriorityRecommendations } from "@/lib/gastown";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "insights";

  try {
    switch (type) {
      case "plan": {
        const plan = getExecutionPlan();
        return NextResponse.json({ plan });
      }
      case "priority": {
        const recommendations = getPriorityRecommendations();
        return NextResponse.json({ recommendations });
      }
      case "insights":
      default: {
        const insights = getInsights();
        return NextResponse.json({ insights });
      }
    }
  } catch (error) {
    console.error("Failed to fetch insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}
