import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { InboxClient } from "./InboxClient";

export default async function InboxPage() {
  const session = await getServerSession(authOptions);
//   if user isnt logged , redirect
  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">
            Inbox
          </h1>
          <p className="mt-2 text-text-muted">
            Welcome back, {session.user?.name ?? "there"}.
          </p>
        </div>
        <Link
          href="/api/auth/signout?callbackUrl=/"
          className="rounded-lg border border-panel-border bg-panel px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-phantom-purple-muted/20 hover:border-phantom-purple/30"
        >
          Sign out
        </Link>
      </div>
      <div className="mt-6">
        <InboxClient userName={session.user?.name ?? undefined} />
      </div>
    </div>
  );
} 

