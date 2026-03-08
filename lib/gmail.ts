import type { Account } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

export async function getGmailClientForUser(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account?.refresh_token) {
    throw new Error("No Google account for this user.");
  }

  return getGmailClientFromAccount(account);
}

// build a gamil api client from a prisma account row
export function getGmailClientFromAccount(account: Account) {
  const { refresh_token, access_token } = account;
  if (!refresh_token) {
    throw new Error("No refresh token for this Google account.");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + "/api/auth/callback/google"
  );

  oauth2Client.setCredentials({
    refresh_token,
    access_token: access_token ?? undefined,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  return gmail;
}
