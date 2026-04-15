import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/** API on Vercel — разрешён как origin (например запросы с той же страницы или Postman с Origin). */
const DEFAULT_PRODUCTION_ORIGIN =
  'https://tests-uploader-api.vercel.app';

function normalizeOrigin(value: string): string {
  return value.replace(/\/$/, '');
}

function extraOriginsFromEnv(): string[] {
  const raw = process.env.WEB_ORIGIN;
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(',')
    .map((s) => normalizeOrigin(s.trim()))
    .filter((s) => s.length > 0);
}

function isLocalDevOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return false;
    }
    return u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

export function buildCorsOptions(): CorsOptions {
  const allowList = new Set<string>([
    normalizeOrigin(DEFAULT_PRODUCTION_ORIGIN),
    ...extraOriginsFromEnv(),
  ]);

  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (origin === undefined || origin === '') {
        callback(null, true);
        return;
      }
      const normalized = normalizeOrigin(origin);
      if (allowList.has(normalized)) {
        callback(null, true);
        return;
      }
      if (isLocalDevOrigin(normalized)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Upload-Secret'],
  };
}
