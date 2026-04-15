import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TestStorageService {
  constructor(private readonly config: ConfigService) {}

  private uploadRoot(): string {
    const configured = this.config.get<string>('UPLOAD_DIR');
    if (configured && configured.length > 0) {
      return configured;
    }
    return join(process.cwd(), 'uploads');
  }

  async saveTestFile(
    testId: string,
    buffer: Buffer,
    originalName: string,
  ): Promise<{ storageKey: string; sizeBytes: number; mime: string }> {
    const root = this.uploadRoot();
    const safeExt = originalName.toLowerCase().endsWith('.txt') ? '.txt' : '.txt';
    const storageKey = join(testId, `source${safeExt}`).replace(/\\/g, '/');
    const absolute = join(root, storageKey);
    await mkdir(dirname(absolute), { recursive: true });
    await writeFile(absolute, buffer);
    return {
      storageKey,
      sizeBytes: buffer.length,
      mime: 'text/plain',
    };
  }

  async readTestFile(storageKey: string): Promise<Buffer> {
    const absolute = join(this.uploadRoot(), storageKey);
    return readFile(absolute);
  }
}
