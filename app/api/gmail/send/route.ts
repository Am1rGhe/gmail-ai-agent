import { authOptions } from "@/lib/auth";
import { getGmailClientForUser } from "@/lib/gmail";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// POST /api/gmail/send Sends an email via gmail API, took me a lot of documentaton and help to make this file

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let to: string;
  let subject: string;
  let body: string;
  let threadId: string | undefined;

  try {
    const data = await request.json();
    to = data.to;
    subject = data.subject ?? "";
    body = data.body ?? "";
    threadId = data.threadId;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!to || typeof to !== "string" || !to.trim()) {
    return NextResponse.json(
      { error: "Missing or invalid 'to' address" },
      { status: 400 }
    );
  }

  // build RFC 2822 message, line endings must be \r\n (asked ai for this one cuz its my first time using it)
  const lines = [
    `To: ${to.trim()}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    body,
  ];
  const rawMessage = lines.join("\r\n");

  // gmail API expects base64url
  const encoded = Buffer.from(rawMessage, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    const gmail = await getGmailClientForUser(session.user.id);
    const requestBody: { raw: string; threadId?: string } = { raw: encoded };
    if (threadId && typeof threadId === "string") {
      requestBody.threadId = threadId.trim();
    }

    await gmail.users.messages.send({
      userId: "me",
      requestBody,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gmail send error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
