import type {
  CheckSampleResponse,
  ChoiceId,
  PublicSampleTest,
  PublishedTestSummary,
} from "./exercise-types";

function apiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  return raw.replace(/\/$/, "");
}

export async function fetchSampleTest(): Promise<PublicSampleTest> {
  const res = await fetch(`${apiBase()}/exercises/sample`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load test (${res.status})`);
  }
  return res.json() as Promise<PublicSampleTest>;
}

export async function submitSampleAnswers(
  answers: Record<string, ChoiceId>,
): Promise<CheckSampleResponse> {
  const res = await fetch(`${apiBase()}/exercises/sample/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) {
    throw new Error(`Failed to check answers (${res.status})`);
  }
  return res.json() as Promise<CheckSampleResponse>;
}

export async function fetchPublishedTests(): Promise<PublishedTestSummary[]> {
  const res = await fetch(`${apiBase()}/tests`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load tests (${res.status})`);
  }
  return res.json() as Promise<PublishedTestSummary[]>;
}

export async function fetchTestExercise(
  testId: string,
): Promise<PublicSampleTest> {
  const res = await fetch(`${apiBase()}/tests/${testId}/exercise`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load test (${res.status})`);
  }
  return res.json() as Promise<PublicSampleTest>;
}

export async function submitTestAnswers(
  testId: string,
  answers: Record<string, ChoiceId>,
): Promise<CheckSampleResponse> {
  const res = await fetch(`${apiBase()}/tests/${testId}/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) {
    throw new Error(`Failed to check answers (${res.status})`);
  }
  return res.json() as Promise<CheckSampleResponse>;
}
