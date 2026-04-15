import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEnglishTestText } from './text-test.parser';

describe('parseEnglishTestText', () => {
  it('parses repository sample_test.txt', () => {
    const path = join(__dirname, '..', '..', '..', 'sample_test.txt');
    const raw = readFileSync(path, 'utf8');
    const questions = parseEnglishTestText(raw);
    expect(questions).toHaveLength(5);
    expect(questions[0].prompt).toContain('She usually');
    expect(questions[0].correctKey).toBe('b');
    expect(questions[1].correctKey).toBe('a');
    expect(questions[2].correctKey).toBe('b');
    expect(questions[3].correctKey).toBe('c');
    expect(questions[4].correctKey).toBe('b');
  });

  it('rejects missing answers section', () => {
    expect(() =>
      parseEnglishTestText(
        '1. Foo?\na) x\nb) y\nc) z\n',
      ),
    ).toThrow(/Correct answers/);
  });
});
