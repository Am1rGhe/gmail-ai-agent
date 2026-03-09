import { authOptions } from "@/lib/auth";
import { getGmailClientForUser } from "@/lib/gmail";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // get logged in user
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // get the id from url
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing email id" }, { status: 400 });
  }

  try {
    // connect to gmail and fetch emails
    const gmail = await getGmailClientForUser(session.user.id);
    const { data } = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "full",
    });
    // extract headers
    const payload = data.payload;
    const headers = payload?.headers ?? [];
    const getHeader = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
        ?.value ?? "";

    let body = "";
    if (payload?.body?.data) {
      body = Buffer.from(payload.body.data, "base64url").toString("utf-8");
    } else if (payload?.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === "text/plain" && part.body?.data) {
          body = Buffer.from(part.body.data, "base64url").toString("utf-8");
          break;
        }
        if (part.mimeType === "text/html" && part.body?.data && !body) {
          body = Buffer.from(part.body.data, "base64url").toString("utf-8");
        }
      }
    }

    return NextResponse.json({
      id: data.id,
      threadId: data.threadId,
      subject: getHeader("Subject"),
      from: getHeader("From"),
      date: getHeader("Date"),
      snippet: data.snippet,
      body,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch email" },
      { status: 500 }
    );
  }
}
