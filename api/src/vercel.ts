import type { IncomingMessage, ServerResponse } from 'node:http';
import serverless from 'serverless-http';
import { createExpressAppInstance } from './app.bootstrap';

let cached: ReturnType<typeof serverless> | undefined;

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (!cached) {
    const expressApp = await createExpressAppInstance();
    cached = serverless(expressApp, {
      binary: true,
    });
  }
  await cached(req, res);
}
