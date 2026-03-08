import { authOptions } from "@/lib/auth";
import { getGmailClientForUser } from "@/lib/gmail";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // get current user
  const session = await getServerSession(authOptions);
  // verify if id exists
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

  try {
    // get auth gmail client
    const gmail = await getGmailClientForUser(session.user.id);
    const { data } = await gmail.users.messages.list({
      userId: "me",
      maxResults: limit,
    });

    // use list message id
    const messages = data.messages ?? [];
    // fetch full message for each email
    const emails = await Promise.all(
      messages.map(async (m) => {
        const { data: msg } = await gmail.users.messages.get({
          userId: "me",
          id: m.id!,
        });
        // add payload
        const payload = msg.payload;
        // add the headers on an array
        const headers = payload?.headers ?? [];
        const getHeader = (name: string) =>
          headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
            ?.value ?? "";
        // now return the object that contains all the informations
        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: msg.snippet,
          subject: getHeader("Subject"),
          from: getHeader("From"),
          date: getHeader("Date"),
        };
      })
    );

    // send the array of emails as json
    return NextResponse.json(emails);
  } catch (err) {
    // log the error for debugging
    console.error(err);
    // tell the client something went wrong
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
