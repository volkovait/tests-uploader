export type ChoiceId = "a" | "b" | "c";

export interface QuestionHint {
  option: ChoiceId;
  text: string;
}

export interface PublicQuestion {
  id: string;
  prompt: string;
  choices: ReadonlyArray<{ id: ChoiceId; text: string }>;
  hints?: ReadonlyArray<QuestionHint>;
}

export interface PublicSampleTest {
  id: string;
  title: string;
  questions: ReadonlyArray<PublicQuestion>;
}

export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  correctChoiceId: ChoiceId;
  selectedChoiceId: ChoiceId | null;
}

export interface CheckSampleResponse {
  score: number;
  total: number;
  results: QuestionResult[];
}

export interface PublishedTestSummary {
  id: string;
  title: string;
  questionCount: number;
}
