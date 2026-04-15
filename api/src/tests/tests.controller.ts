import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import type {
  CheckAnswersBody,
  CheckAnswersResponse,
  PublicExercisePayload,
} from '../common/exercise-contract';
import { UploadSecretGuard } from './upload-secret.guard';
import { TestsService } from './tests.service';

@Controller('tests')
export class TestsController {
  constructor(private readonly tests: TestsService) {}

  @Post('upload')
  @UseGuards(UploadSecretGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 512 * 1024 },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('title') title?: string,
  ): Promise<{ id: string; status: string }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Multipart field "file" is required');
    }
    const name = file.originalname ?? 'upload.txt';
    if (!name.toLowerCase().endsWith('.txt')) {
      throw new BadRequestException('Only .txt uploads are supported');
    }
    const mime = file.mimetype ?? '';
    if (
      mime !== 'text/plain' &&
      mime !== 'application/octet-stream' &&
      mime !== ''
    ) {
      throw new BadRequestException('File must be text/plain');
    }
    return this.tests.createTextUpload(file.buffer, name, title);
  }

  @Get()
  listPublished() {
    return this.tests.listPublished();
  }

  @Get(':testId/exercise')
  getExercise(@Param('testId') testId: string): Promise<PublicExercisePayload> {
    return this.tests.getPublishedExercise(testId);
  }

  @Post(':testId/check')
  check(
    @Param('testId') testId: string,
    @Body() body: CheckAnswersBody,
  ): Promise<CheckAnswersResponse> {
    return this.tests.checkPublished(testId, body);
  }

  @Post(':testId/publish')
  @UseGuards(UploadSecretGuard)
  publish(@Param('testId') testId: string) {
    return this.tests.publish(testId);
  }

  @Get(':testId/admin')
  @UseGuards(UploadSecretGuard)
  getAdmin(@Param('testId') testId: string) {
    return this.tests.getAdminTest(testId);
  }
}
