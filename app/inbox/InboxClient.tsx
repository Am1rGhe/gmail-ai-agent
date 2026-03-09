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

  const [body, setBody] = useState<string | null>(null);
  const [bodyLoading, setBodyLoading] = useState(false);
  const [bodyError, setBodyError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!selected) {
      setBody(null);
      setBodyError(null);
      return;
    }
    setBodyLoading(true);
    setBodyError(null);
    fetch(`/api/gmail/emails/${selected.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load email");
        return res.json();
      })
      .then((data) => {
        setBody(data.body ?? "");
        setBodyError(null);
      })
      .catch((err) => {
        setBodyError(err.message ?? "Failed to load email");
        setBody(null);
      })
      .finally(() => setBodyLoading(false));
  }, [selected?.id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
        Loading emails...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-text-muted">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-130px)] gap-4">
      <div className="w-[380px] shrink-0 overflow-y-auto rounded-xl border border-panel-border bg-panel">
        {emails.length === 0 ? (
          <p className="p-4 text-text-muted">No emails</p>
        ) : (
          <ul className="divide-y divide-panel-border">
            {emails.map((email) => (
              <li
                key={email.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(email)}
                onKeyDown={(e) => e.key === "Enter" && setSelected(email)}
                className={`cursor-pointer px-4 py-3 text-left transition-colors hover:bg-phantom-purple/10 hover:border-l-2 hover:border-l-phantom-purple ${
                  selected?.id === email.id
                    ? "bg-phantom-purple/10 border-l-2 border-l-phantom-purple"
                    : "border-l-2 border-l-transparent"
                }`}
              >
                <p className="truncate font-medium text-text">
                  {email.subject || "(no subject)"}
                </p>
                <p className="truncate text-sm text-text-muted">{email.from}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-text-muted">
                  {email.snippet}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto rounded-xl border border-panel-border bg-panel p-6">
        {selected ? (
          <>
            <h2 className="text-xl font-semibold text-text">
              {selected.subject || "(no subject)"}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              From: {selected.from} · {selected.date}
            </p>
            <div className="mt-4 text-text">
              {bodyLoading ? (
                <p className="text-text-muted">Loading...</p>
              ) : bodyError ? (
                <p className="text-red-400">{bodyError}</p>
              ) : body ? (
                body.trim().startsWith("<") ? (
                  <iframe
                    sandbox="sandbox"
                    title="Email content"
                    srcDoc={body}
                    className="mt-2 min-h-[400px] w-full rounded-lg border-0 bg-white"
                    style={{ minHeight: "400px" }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap break-words text-sm">
                    {body}
                  </div>
                )
              ) : (
                <p className="text-text-muted">{selected.snippet}</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-text-muted">Select an email</p>
        )}
      </div>
    </div>
  );
}
