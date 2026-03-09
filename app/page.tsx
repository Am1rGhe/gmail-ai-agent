import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignInButton } from "./components/SingInButton";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <main className="flex max-w-xl flex-col items-center gap-10 text-center">
        <h1 className="title-animated text-5xl font-bold tracking-tight">
          Gmail Agent
        </h1>
        <p className="text-lg leading-relaxed text-text-muted">
          Handle your inbox faster. Auto-reply, AI replies with the tone you
          choose, and see your emails in one place.
        </p>

        {error && (
          <p className="rounded-lg bg-red-950/50 px-4 py-2 text-sm text-red-400">
            Sign-in failed: {error}. Try again or use the same Google account you added as a test user.
          </p>
        )}

        {session ? (
          <Link
            href="/inbox"
            className="rounded-full bg-phantom-purple px-8 py-3 text-base font-medium text-white cursor-pointer transition-colors hover:bg-phantom-purple-hover"
          >
            Go to inbox
          </Link>
        ) : (
          <SignInButton />
        )}
      </main>
    </div>
  );
}
