import { ExerciseClient } from "./exercise-client";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <ExerciseClient variant="sample" />
      </div>
    </div>
  );
}
