"use client";
import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/inbox" })}
      className="rounded-full bg-foreground px-8 py-3 text-base font-medium text-background cursor-pointer transition-colors hover:opacity-90 "
    >
      Start With Google
    </button>
  );
}
