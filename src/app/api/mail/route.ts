import { NextRequest, NextResponse } from "next/server";
import { getInbox, getAnnounces, sendMail } from "@/lib/gastown";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const agent = searchParams.get("agent");
  const announces = searchParams.get("announces") === "true";

  try {
    if (announces) {
      const messages = getAnnounces();
      return NextResponse.json({ messages });
    }

    if (agent) {
      const messages = getInbox(agent);
      return NextResponse.json({ messages });
    }

    return NextResponse.json(
      { error: "agent parameter or announces=true is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to fetch mail:", error);
    return NextResponse.json(
      { error: "Failed to fetch mail" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, body: messageBody } = body;

    if (!to || !subject || !messageBody) {
      return NextResponse.json(
        { error: "to, subject, and body are required" },
        { status: 400 }
      );
    }

    const success = sendMail(to, subject, messageBody);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to send mail" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to send mail:", error);
    return NextResponse.json(
      { error: "Failed to send mail" },
      { status: 500 }
    );
  }
}
