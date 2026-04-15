import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Express, NextFunction, Request, Response } from 'express';
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

  // #region agent log
  app.use((req: Request, res: Response, next: NextFunction) => {
    const payload = {
      sessionId: '6bce17',
      location: 'app.bootstrap.ts:request-mw',
      message: 'nest received',
      data: {
        hypothesisId: 'H3',
        method: req.method,
        url: req.url,
        path: req.path,
        originalUrl: req.originalUrl,
      },
      timestamp: Date.now(),
    };
    const line = JSON.stringify(payload);
    console.log('[agent-debug]', line);
    fetch('http://127.0.0.1:7447/ingest/3fc66898-37a1-4c91-80bb-cce8e3eaf704', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '6bce17',
      },
      body: line,
    }).catch(() => {});
    next();
  });
  // #endregion

  await app.init();
  return expressApp;
}
