"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchSampleTest,
  fetchTestExercise,
  submitSampleAnswers,
  submitTestAnswers,
} from "@/lib/exercise-api";
import type {
  CheckSampleResponse,
  ChoiceId,
  PublicSampleTest,
} from "@/lib/exercise-types";

type Variant = "sample" | "test";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; test: PublicSampleTest };

export interface ExerciseClientProps {
  variant: Variant;
  testId?: string;
}

export function ExerciseClient({ variant, testId }: ExerciseClientProps) {
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [selections, setSelections] = useState<Record<string, ChoiceId>>({});
  const [feedback, setFeedback] = useState<CheckSampleResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (variant === "test" && (!testId || testId.length === 0)) {
      setLoad({
        status: "error",
        message: "Missing test id",
      });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const test =
          variant === "sample"
            ? await fetchSampleTest()
            : await fetchTestExercise(testId as string);
        if (!cancelled) {
          setLoad({ status: "ready", test });
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        if (!cancelled) {
          setLoad({ status: "error", message });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [variant, testId]);

  const onSelect = useCallback((questionId: string, choice: ChoiceId) => {
    setSelections((prev) => ({ ...prev, [questionId]: choice }));
    setFeedback(null);
  }, []);

  const onCheck = useCallback(async () => {
    if (load.status !== "ready") return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const result =
        variant === "sample"
          ? await submitSampleAnswers(selections)
          : await submitTestAnswers(testId as string, selections);
      setFeedback(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  }, [load, selections, variant, testId]);

  const resultByQuestionId = useMemo(() => {
    if (!feedback) return null;
    const map = new Map<string, (typeof feedback.results)[number]>();
    for (const r of feedback.results) {
      map.set(r.questionId, r);
    }
    return map;
  }, [feedback]);

  if (load.status === "loading") {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Loading exercise…
      </p>
    );
  }

  if (load.status === "error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
        <p className="font-medium">Could not load the exercise</p>
        <p className="mt-1 opacity-90">{load.message}</p>
        <p className="mt-2 text-xs opacity-80">
          Make sure the API is running on{" "}
          <code className="rounded bg-red-100 px-1 py-0.5 dark:bg-red-900/50">
            {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}
          </code>
          .
        </p>
      </div>
    );
  }

  const { test } = load;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{test.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Choose the correct option for each sentence, then press Check answers.
        </p>
      </header>

      <ol className="space-y-8">
        {test.questions.map((q, index) => {
          const row = resultByQuestionId?.get(q.id);
          const wrongHint =
            row &&
            !row.isCorrect &&
            row.selectedChoiceId &&
            q.hints?.find((h) => h.option === row.selectedChoiceId);

          return (
            <li
              key={q.id}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
            >
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {index + 1}.
              </p>
              <p className="mt-1 text-base leading-relaxed">{q.prompt}</p>
              <fieldset className="mt-4 space-y-2">
                <legend className="sr-only">Options for question {index + 1}</legend>
                {q.choices.map((c) => {
                  const selected = selections[q.id] === c.id;
                  const show = Boolean(row);
                  const isCorrectChoice = row && c.id === row.correctChoiceId;
                  const isWrongSelected =
                    row && selected && !row.isCorrect && c.id === row.selectedChoiceId;

                  let optionClass =
                    "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors";
                  if (!show) {
                    optionClass += selected
                      ? " border-neutral-900 bg-neutral-50 dark:border-neutral-100 dark:bg-neutral-900"
                      : " border-neutral-200 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600";
                  } else if (isCorrectChoice) {
                    optionClass +=
                      " border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/40";
                  } else if (isWrongSelected) {
                    optionClass +=
                      " border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/40";
                  } else {
                    optionClass +=
                      " border-neutral-200 opacity-60 dark:border-neutral-800";
                  }

                  return (
                    <label key={c.id} className={optionClass}>
                      <input
                        type="radio"
                        className="h-4 w-4 accent-neutral-900 dark:accent-neutral-100"
                        name={q.id}
                        value={c.id}
                        checked={selected}
                        onChange={() => onSelect(q.id, c.id)}
                      />
                      <span>
                        <span className="mr-2 font-mono text-xs uppercase text-neutral-500">
                          {c.id})
                        </span>
                        {c.text}
                      </span>
                    </label>
                  );
                })}
              </fieldset>
              {wrongHint ? (
                <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
                  {wrongHint.text}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onCheck()}
          disabled={submitting}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
        >
          {submitting ? "Checking…" : "Check answers"}
        </button>
        {feedback ? (
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Score:{" "}
            <span className="font-semibold">
              {feedback.score}/{feedback.total}
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
