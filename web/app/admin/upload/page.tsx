"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function apiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  return raw.replace(/\/$/, "");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default function AdminUploadPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!file) {
      setMessage("Choose a .txt file");
      return;
    }
    if (!secret) {
      setMessage("Enter the upload secret (same as ADMIN_UPLOAD_SECRET on the API)");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (title.trim()) {
        fd.append("title", title.trim());
      }
      const res = await fetch(`${apiBase()}/tests/upload`, {
        method: "POST",
        headers: { "X-Upload-Secret": secret },
        body: fd,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed (${res.status})`);
      }
      let body = (await res.json()) as { id: string; status: string };
      for (let i = 0; i < 60 && body.status === "parsing"; i += 1) {
        await sleep(400);
        const st = await fetch(`${apiBase()}/tests/${body.id}/admin`, {
          headers: { "X-Upload-Secret": secret },
        });
        if (!st.ok) {
          throw new Error(`Could not read test status (${st.status})`);
        }
        const meta = (await st.json()) as { status: string };
        body = { id: body.id, status: meta.status };
      }
      if (body.status === "failed_parse") {
        throw new Error(
          "Parsing failed. Check the file format and the API admin payload for errorMessage.",
        );
      }
      if (body.status !== "draft") {
        throw new Error(`Unexpected status after upload: ${body.status}`);
      }
      setMessage("Parsed. Publishing…");
      const pub = await fetch(`${apiBase()}/tests/${body.id}/publish`, {
        method: "POST",
        headers: { "X-Upload-Secret": secret },
      });
      if (!pub.ok) {
        const text = await pub.text();
        throw new Error(text || `Publish failed (${pub.status})`);
      }
      router.push(`/tests/${body.id}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Upload test (.txt)</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            File format matches <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">sample_test.txt</code> in the repo (questions, choices, and a &quot;Correct answers:&quot; block).
          </p>
        </header>

        <form onSubmit={(ev) => void onSubmit(ev)} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Upload secret</span>
            <input
              type="password"
              autoComplete="off"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
              placeholder="ADMIN_UPLOAD_SECRET"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Title (optional)</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
              placeholder="e.g. Present Simple review"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Text file</span>
            <input
              type="file"
              accept=".txt,text/plain"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
          >
            {busy ? "Working…" : "Upload and publish"}
          </button>
        </form>

        {message ? (
          <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
