"use client";
import { useEffect, useState } from "react";

type EmailItem = {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
};

export function InboxClient() {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [selected, setSelected] = useState<EmailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/gmail/emails")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch emails");
        return res.json();
      })
      .then((data) => {
        setEmails(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message ?? "something went wrong, try again");
        setLoading(false);
      });
  }, []);
  //   display loading state
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">
        Loading emails...
      </div>
    );
  }
  // display error
  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-zinc-500">
        {error}
      </div>
    );
  }
  return (
    // main container
    <div className="flex h-[calc(100vh-130px)] gap-4">
      {/* emails list */}
      <div className="w-[380px] shrink-0 overflow-y-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {emails.length === 0 ? (
          <p className="p-4 text-zinc-500">No emails</p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {emails.map((email) => (
              <li
                key={email.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(email)}
                onKeyDown={(e) => e.key === "Enter" && setSelected(email)}
                className={`cursor-pointer px-4 py-3 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                  selected?.id === email.id
                    ? "bg-zinc-100 dark:bg-zinc-800"
                    : ""
                }`}
              >
                <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                  {email.subject || "(no subject)"}
                </p>
                <p className="truncate text-sm text-zinc-500">{email.from}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {email.snippet}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* right section : selected email info */}
      <div className="min-w-0 flex-1 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        { selected?(
            <>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    {selected.subject || "(no subject)"}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                    From: {selected.from} - {selected.date}
                </p>
                <p className="mt-4 text-zinc-700 dark:text-zinc-300">
                    {selected.snippet}
                </p>
            </>
        ):(
            <p className="text-zinc-500">Select an email</p>
        )}

      </div>
    </div>
  );
}
