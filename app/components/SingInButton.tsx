"use client";
import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/inbox" })}
      className="rounded-full bg-phantom-purple px-8 py-3 text-base font-medium text-white cursor-pointer transition-colors hover:bg-phantom-purple-hover"
    >
      Start With Google
    </button>
  );
}
