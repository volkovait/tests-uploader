/**
 * Содержимое синхронизировано с `sample_test.txt` в корне репозитория.
 */
export type ChoiceId = 'a' | 'b' | 'c';

export interface SampleQuestion {
  id: string;
  prompt: string;
  choices: ReadonlyArray<{ id: ChoiceId; text: string }>;
  correctChoiceId: ChoiceId;
}

export interface SampleTest {
  id: string;
  title: string;
  questions: ReadonlyArray<SampleQuestion>;
}

export const SAMPLE_TEST: SampleTest = {
  id: 'present-simple-1',
  title: 'Present Simple — gap fill',
  questions: [
    {
      id: 'q1',
      prompt: 'She usually ______ to school by bus.',
      choices: [
        { id: 'a', text: 'go' },
        { id: 'b', text: 'goes' },
        { id: 'c', text: 'going' },
      ],
      correctChoiceId: 'b',
    },
    {
      id: 'q2',
      prompt: 'We ______ English every Monday.',
      choices: [
        { id: 'a', text: 'study' },
        { id: 'b', text: 'studies' },
        { id: 'c', text: 'studying' },
      ],
      correctChoiceId: 'a',
    },
    {
      id: 'q3',
      prompt: '______ he play football on weekends?',
      choices: [
        { id: 'a', text: 'Do' },
        { id: 'b', text: 'Does' },
        { id: 'c', text: 'Is' },
      ],
      correctChoiceId: 'b',
    },
    {
      id: 'q4',
      prompt: 'They ______ their homework in the evening.',
      choices: [
        { id: 'a', text: "doesn't do" },
        { id: 'b', text: "don't does" },
        { id: 'c', text: "don't do" },
      ],
      correctChoiceId: 'c',
    },
    {
      id: 'q5',
      prompt: 'My cat ______ milk every morning.',
      choices: [
        { id: 'a', text: 'drink' },
        { id: 'b', text: 'drinks' },
        { id: 'c', text: 'drinking' },
      ],
      correctChoiceId: 'b',
    },
  ],
};
