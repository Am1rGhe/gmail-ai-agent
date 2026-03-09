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

  //   ai states
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [tone, setTone] = useState<"professional" | "casual" | "friendly">(
    "friendly"
  );

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
      setAiReply(null);
      setAiError(null);
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

  // handle replies with ai
  async function handleReplyWithAI() {
    // no email selected return
    if (!selected) return;
    setAiLoading(true);
    setAiError(null);
    setAiReply(null);
    try {
      // use full body or snippet  strip html and limit length
      const emailBody =
        typeof body === "string"
          ? body
              .replace(/<[^>]*>/g, " ")
              .trim()
              .slice(0, 4000) || selected.snippet
          : selected.snippet;

      const res = await fetch("/api/ai/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailSubject: selected.subject,
          emailFrom: selected.from,
          emailBody,
          tone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate reply");
      setAiReply(data.reply ?? "");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAiLoading(false);
    }
  }

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
      <div className="scrollbar-hide w-[380px] shrink-0 overflow-y-auto rounded-xl border border-panel-border bg-panel">
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
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <select
                value={tone}
                onChange={(e) =>
                  setTone(e.target.value as "professional" | "casual" | "friendly")
                }
                className="rounded-lg border border-panel-border bg-panel px-3 py-2 text-sm text-text focus:border-phantom-purple focus:outline-none cursor-pointer"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
              </select>
              <button
                type="button"
                onClick={handleReplyWithAI}
                disabled={aiLoading}
                className="rounded-lg bg-phantom-purple px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-phantom-purple-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {aiLoading ? "Generating…" : "Reply with AI"}
              </button>
            </div>
            {aiError && (
              <p className="mt-2 text-sm text-red-400">{aiError}</p>
            )}
            {aiReply && (
              <div className="mt-4 rounded-lg border border-panel-border bg-panel p-4">
                <p className="mb-2 text-sm font-medium text-text-muted">
                  Suggested reply
                </p>
                <textarea
                  readOnly
                  value={aiReply}
                  rows={8}
                  className="w-full resize-none rounded-lg border border-panel-border bg-background px-3 py-2 text-sm text-text focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(aiReply)}
                  className="mt-2 rounded-lg border border-panel-border bg-panel px-3 py-1.5 text-sm text-text hover:bg-phantom-purple/10 hover:border-phantom-purple/30 cursor-pointer"
                >
                  Copy
                </button>
              </div>
            )}
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
