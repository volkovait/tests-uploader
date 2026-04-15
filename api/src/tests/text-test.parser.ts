export type ChoiceLetter = 'a' | 'b' | 'c';

export interface ParsedChoice {
  key: ChoiceLetter;
  text: string;
}

export interface ParsedQuestion {
  prompt: string;
  choices: ParsedChoice[];
  correctKey: ChoiceLetter;
}

interface ParsedQuestionDraft {
  prompt: string;
  choices: ParsedChoice[];
}

const QUESTION_LINE = /^(\d+)\.\s*(.+)$/;
const CHOICE_LINE = /^([abc])\)\s*(.+)$/i;
const CORRECT_HEADER = /^correct answers:\s*$/i;

function normalizeLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function isChoiceLetter(s: string): s is ChoiceLetter {
  return s === 'a' || s === 'b' || s === 'c';
}

export class TextTestParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TextTestParseError';
  }
}

/**
 * Parses `.txt` tests in the same shape as `sample_test.txt`:
 * numbered questions, `a)` / `b)` / `c)` choices, optional `Correct answers:` block
 * with one line per question (`b) goes`, …).
 */
export function parseEnglishTestText(raw: string): ParsedQuestion[] {
  const lines = normalizeLines(raw);
  const headerIdx = lines.findIndex((l) => CORRECT_HEADER.test(l));

  const questionLines =
    headerIdx === -1 ? lines : lines.slice(0, headerIdx);
  const answerLines =
    headerIdx === -1 ? [] : lines.slice(headerIdx + 1);

  const drafts: ParsedQuestionDraft[] = [];
  let i = 0;
  while (i < questionLines.length) {
    const qm = questionLines[i].match(QUESTION_LINE);
    if (!qm) {
      throw new TextTestParseError(
        `Expected question line like "1. ..." at line ${i + 1}, got: ${questionLines[i]}`,
      );
    }
    const prompt = qm[2].trim();
    i += 1;
    const choices: ParsedChoice[] = [];
    for (let k = 0; k < 3; k += 1) {
      if (i >= questionLines.length) {
        throw new TextTestParseError(
          `Question "${prompt.slice(0, 40)}..." is missing choice lines`,
        );
      }
      const cm = questionLines[i].match(CHOICE_LINE);
      if (!cm) {
        throw new TextTestParseError(
          `Expected choice line a)/b)/c) after question, got: ${questionLines[i]}`,
        );
      }
      const letter = cm[1].toLowerCase();
      if (!isChoiceLetter(letter)) {
        throw new TextTestParseError(`Invalid choice key: ${letter}`);
      }
      choices.push({ key: letter, text: cm[2].trim() });
      i += 1;
    }
    const keys = new Set(choices.map((c) => c.key));
    if (keys.size !== 3) {
      throw new TextTestParseError('Each question must have a, b, and c choices');
    }
    drafts.push({ prompt, choices });
  }

  if (drafts.length === 0) {
    throw new TextTestParseError('No questions found');
  }

  if (answerLines.length === 0) {
    throw new TextTestParseError(
      'Missing "Correct answers:" section with one line per question',
    );
  }
  if (answerLines.length !== drafts.length) {
    throw new TextTestParseError(
      `Expected ${drafts.length} answer lines, got ${answerLines.length}`,
    );
  }

  const questions: ParsedQuestion[] = drafts.map((d, q) => {
    const am = answerLines[q].match(CHOICE_LINE);
    if (!am) {
      throw new TextTestParseError(
        `Invalid answer line ${q + 1}: ${answerLines[q]}`,
      );
    }
    const letter = am[1].toLowerCase();
    if (!isChoiceLetter(letter)) {
      throw new TextTestParseError(`Invalid answer key on line ${q + 1}`);
    }
    return { ...d, correctKey: letter };
  });

  return questions;
}
