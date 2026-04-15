import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Express } from 'express';
import express from 'express';
import { buildCorsOptions } from './cors-options';
import { AppModule } from './app.module';

function applyCors(app: INestApplication): void {
  app.enableCors(buildCorsOptions());
}

/**
 * Shared HTTP stack for local `nest start` and Vercel serverless.
 */
export async function createExpressAppInstance(): Promise<Express> {
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter, {
    logger: ['error', 'warn', 'log'],
  });
  applyCors(app);
  await app.init();
  return expressApp;
}
