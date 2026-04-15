import { BadRequestException, Injectable } from '@nestjs/common';
import { SAMPLE_TEST, type ChoiceId, type SampleTest } from './sample-test.data';

export interface PublicQuestion {
  id: string;
  prompt: string;
  choices: ReadonlyArray<{ id: ChoiceId; text: string }>;
}

export interface PublicSampleTest {
  id: string;
  title: string;
  questions: ReadonlyArray<PublicQuestion>;
}

export interface CheckSampleBody {
  answers: Record<string, ChoiceId | undefined>;
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

@Injectable()
export class ExercisesService {
  getSampleTest(): PublicSampleTest {
    return {
      id: SAMPLE_TEST.id,
      title: SAMPLE_TEST.title,
      questions: SAMPLE_TEST.questions.map(({ id, prompt, choices }) => ({
        id,
        prompt,
        choices,
      })),
    };
  }

  checkSampleTest(body: CheckSampleBody): CheckSampleResponse {
    const answers = body?.answers;
    if (!answers || typeof answers !== 'object') {
      throw new BadRequestException('answers must be an object');
    }

    const results: QuestionResult[] = SAMPLE_TEST.questions.map((q) => {
      const selected = answers[q.id];
      const selectedChoiceId =
        selected === 'a' || selected === 'b' || selected === 'c'
          ? selected
          : null;

      return {
        questionId: q.id,
        isCorrect: selectedChoiceId === q.correctChoiceId,
        correctChoiceId: q.correctChoiceId,
        selectedChoiceId,
      };
    });

    const score = results.filter((r) => r.isCorrect).length;

    return {
      score,
      total: SAMPLE_TEST.questions.length,
      results,
    };
  }

  /** Для будущего подключения БД: единая точка доступа к «текущему» сэмплу. */
  getSampleTestSource(): SampleTest {
    return SAMPLE_TEST;
  }
}
