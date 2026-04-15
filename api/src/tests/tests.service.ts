import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma, TestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CheckAnswersBody,
  CheckAnswersResponse,
  ChoiceId,
  PublicExercisePayload,
  PublicQuestion,
  QuestionHint,
  QuestionResult,
} from '../common/exercise-contract';
import { TestStorageService } from './test-storage.service';
import { TextTestParseError, parseEnglishTestText } from './text-test.parser';

function isChoiceId(value: string | undefined): value is ChoiceId {
  return value === 'a' || value === 'b' || value === 'c';
}

function mapHints(raw: Prisma.JsonValue | null): QuestionHint[] | undefined {
  if (raw === null || raw === undefined) {
    return undefined;
  }
  if (!Array.isArray(raw)) {
    return undefined;
  }
  const hints: QuestionHint[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === 'object' &&
      'option' in item &&
      'text' in item &&
      typeof (item as { option: unknown }).option === 'string' &&
      typeof (item as { text: unknown }).text === 'string'
    ) {
      const opt = (item as { option: string }).option.toLowerCase();
      if (isChoiceId(opt)) {
        hints.push({ option: opt, text: (item as { text: string }).text });
      }
    }
  }
  return hints.length > 0 ? hints : undefined;
}

@Injectable()
export class TestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: TestStorageService,
    private readonly config: ConfigService,
    @InjectQueue('parse-test') private readonly parseQueue: Queue,
  ) {}

  private useSyncParse(): boolean {
    const v = this.config.get<string>('SYNC_PARSE');
    return v === '1' || v === 'true' || v === 'yes';
  }

  async listPublished(): Promise<
    Array<{ id: string; title: string; questionCount: number }>
  > {
    const rows = await this.prisma.test.findMany({
      where: { status: TestStatus.published },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        _count: { select: { questions: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      questionCount: r._count.questions,
    }));
  }

  async getPublishedExercise(testId: string): Promise<PublicExercisePayload> {
    const test = await this.prisma.test.findFirst({
      where: { id: testId, status: TestStatus.published },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
          include: { choices: { orderBy: { key: 'asc' } } },
        },
      },
    });
    if (!test) {
      throw new NotFoundException('Test not found or not published');
    }
    return this.toPublicPayload(test);
  }

  async checkPublished(
    testId: string,
    body: CheckAnswersBody,
  ): Promise<CheckAnswersResponse> {
    const test = await this.prisma.test.findFirst({
      where: { id: testId, status: TestStatus.published },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
          include: { choices: true },
        },
      },
    });
    if (!test) {
      throw new NotFoundException('Test not found or not published');
    }
    const answers = body?.answers;
    if (!answers || typeof answers !== 'object') {
      throw new BadRequestException('answers must be an object');
    }

    const results: QuestionResult[] = test.questions.map((q) => {
      const selected = answers[q.clientKey];
      const selectedChoiceId = isChoiceId(selected) ? selected : null;
      const correct = q.choices.find((c) => c.isCorrect);
      if (!correct || !isChoiceId(correct.key)) {
        throw new InternalServerErrorException(
          `Question ${q.clientKey} is missing a single valid correct choice`,
        );
      }
      return {
        questionId: q.clientKey,
        isCorrect: selectedChoiceId === correct.key,
        correctChoiceId: correct.key,
        selectedChoiceId,
      };
    });

    const score = results.filter((r) => r.isCorrect).length;
    return { score, total: test.questions.length, results };
  }

  async createTextUpload(
    buffer: Buffer,
    originalName: string,
    title?: string,
  ): Promise<{ id: string; status: TestStatus }> {
    const baseTitle =
      title && title.trim().length > 0
        ? title.trim()
        : originalName.replace(/\.[^/.]+$/, '') || 'Imported test';

    const test = await this.prisma.test.create({
      data: {
        title: baseTitle,
        status: TestStatus.parsing,
        sourceFilename: originalName,
      },
    });

    const saved = await this.storage.saveTestFile(test.id, buffer, originalName);
    await this.prisma.testSourceFile.create({
      data: {
        testId: test.id,
        storageKey: saved.storageKey,
        mime: saved.mime,
        sizeBytes: saved.sizeBytes,
      },
    });

    if (this.useSyncParse()) {
      await this.runParseJob(test.id);
    } else {
      await this.parseQueue.add('parse', { testId: test.id });
    }

    const updated = await this.prisma.test.findUniqueOrThrow({
      where: { id: test.id },
    });
    return { id: updated.id, status: updated.status };
  }

  async runParseJob(testId: string): Promise<void> {
    try {
      const test = await this.prisma.test.findUnique({
        where: { id: testId },
        include: { sourceFiles: true },
      });
      if (!test || test.sourceFiles.length === 0) {
        throw new Error('Test or source file missing');
      }
      const file = test.sourceFiles[0];
      const raw = await this.storage.readTestFile(file.storageKey);
      const parsed = parseEnglishTestText(raw.toString('utf8'));

      await this.prisma.$transaction(async (tx) => {
        await tx.testQuestion.deleteMany({ where: { testId } });
        for (let i = 0; i < parsed.length; i += 1) {
          const pq = parsed[i];
          await tx.testQuestion.create({
            data: {
              testId,
              sortOrder: i,
              clientKey: `q${i + 1}`,
              prompt: pq.prompt,
              choices: {
                create: pq.choices.map((c) => ({
                  key: c.key,
                  text: c.text,
                  isCorrect: c.key === pq.correctKey,
                })),
              },
            },
          });
        }
        await tx.test.update({
          where: { id: testId },
          data: {
            status: TestStatus.draft,
            parsedAt: new Date(),
            errorMessage: null,
          },
        });
      });
    } catch (err) {
      const message =
        err instanceof TextTestParseError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Parse failed';
      await this.prisma.test.update({
        where: { id: testId },
        data: {
          status: TestStatus.failed_parse,
          errorMessage: message,
          parsedAt: new Date(),
        },
      });
    }
  }

  async publish(testId: string): Promise<{ id: string; status: TestStatus }> {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: { questions: { include: { choices: true } } },
    });
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    if (test.status !== TestStatus.draft) {
      throw new BadRequestException('Only draft tests can be published');
    }
    if (test.questions.length === 0) {
      throw new BadRequestException('Test has no questions');
    }
    for (const q of test.questions) {
      const correct = q.choices.filter((c) => c.isCorrect);
      if (correct.length !== 1) {
        throw new BadRequestException(
          `Question ${q.clientKey} must have exactly one correct choice`,
        );
      }
    }
    await this.prisma.test.update({
      where: { id: testId },
      data: { status: TestStatus.published },
    });
    return { id: testId, status: TestStatus.published };
  }

  async getAdminTest(testId: string) {
    return this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: { orderBy: { sortOrder: 'asc' }, include: { choices: true } },
        sourceFiles: true,
      },
    });
  }

  private toPublicPayload(test: {
    id: string;
    title: string;
    questions: Array<{
      clientKey: string;
      prompt: string;
      hint: Prisma.JsonValue | null;
      choices: Array<{ key: string; text: string }>;
    }>;
  }): PublicExercisePayload {
    const questions: PublicQuestion[] = test.questions.map((q) => {
      const hints = mapHints(q.hint);
      const choices = q.choices.map((c) => {
        const id = c.key.toLowerCase();
        if (!isChoiceId(id)) {
          throw new Error(`Invalid stored choice key: ${c.key}`);
        }
        return { id, text: c.text };
      });
      return {
        id: q.clientKey,
        prompt: q.prompt,
        choices,
        ...(hints ? { hints } : {}),
      };
    });
    return { id: test.id, title: test.title, questions };
  }
}
