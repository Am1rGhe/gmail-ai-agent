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
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Inbox
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            You are signed in.
          </p>
        </div>
        <Link
          href="/api/auth/signout?callbackUrl=/"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Sign out
        </Link>
      </div>
      <div className="mt-6">
        <InboxClient />
      </div>
    </div>
  );
} 

