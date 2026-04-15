import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { TestsService } from './tests.service';

@Processor('parse-test')
export class ParseTestProcessor extends WorkerHost {
  constructor(private readonly tests: TestsService) {
    super();
  }

  async process(job: Job<{ testId: string }>): Promise<void> {
    await this.tests.runParseJob(job.data.testId);
  }
}
