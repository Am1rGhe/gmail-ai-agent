import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignInButton } from "./components/SingInButton";
import { link } from "fs/promises";




export default async function Home() {
  // start session 
  const session = await getServerSession(authOptions)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
      {/* main section */}
      <main className="flex max-w-xl flex-col items-center gap-10 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 ">
          Gmail Agent
        </h1>
        <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400" 
        >Handle your inbox faster. Auto-reply, AI replies with the tone you
          choose, and see your emails in one place.
        </p>
        
        { session?(
          <Link 
          href="/inbox"
          className="rounded-full bg-foreground px-8 py-3 text-base font-medium text-background transition-colors cursor-pointer hover:opacity-90"
          >
            Go to inbox
          </Link>

        ):(
          <SignInButton/>
        )
      }

      </main>

    </div>
  );
}
