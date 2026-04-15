import Link from "next/link";
import { fetchPublishedTests } from "@/lib/exercise-api";

export default async function TestsCatalogPage() {
  let tests: Awaited<ReturnType<typeof fetchPublishedTests>> = [];
  let error: string | null = null;
  try {
    tests = await fetchPublishedTests();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load tests";
  }

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Tests</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Published exercises from the library.
          </p>
        </header>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
            {error}
          </div>
        ) : tests.length === 0 ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            No published tests yet. Upload a <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">.txt</code> file in the admin section, then publish it.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-950">
            {tests.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/tests/${t.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-4 text-sm transition hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  <span className="font-medium">{t.title}</span>
                  <span className="shrink-0 text-neutral-500 dark:text-neutral-400">
                    {t.questionCount} questions
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
