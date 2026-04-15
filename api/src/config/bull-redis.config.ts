import type { ConfigService } from '@nestjs/config';

/**
 * Options passed to BullMQ / ioredis. `maxRetriesPerRequest: null` is recommended for Bull workers.
 */
export function buildBullRedisConnection(
  config: ConfigService,
): Record<string, unknown> {
  const fromUrl = config.get<string>('REDIS_URL');
  if (fromUrl && fromUrl.trim().length > 0) {
    try {
      const u = new URL(fromUrl.trim());
      const useTls = u.protocol === 'rediss:';
      const port = u.port ? Number(u.port) : 6379;
      const password =
        u.password !== '' ? decodeURIComponent(u.password) : undefined;
      const username =
        u.username !== '' ? decodeURIComponent(u.username) : undefined;
      return {
        host: u.hostname,
        port,
        ...(username ? { username } : {}),
        ...(password ? { password } : {}),
        ...(useTls ? { tls: {} } : {}),
        maxRetriesPerRequest: null,
      };
    } catch {
      // fall through to discrete env vars
    }
  }

  const tlsEnabled =
    config.get<string>('REDIS_TLS') === '1' ||
    config.get<string>('REDIS_TLS') === 'true';

  const password = config.get<string>('REDIS_PASSWORD');
  const username = config.get<string>('REDIS_USERNAME');

  return {
    host: config.get<string>('REDIS_HOST', '127.0.0.1'),
    port: Number(config.get<string>('REDIS_PORT', '6379')),
    ...(username ? { username } : {}),
    ...(password ? { password } : {}),
    ...(tlsEnabled ? { tls: {} } : {}),
    maxRetriesPerRequest: null,
  };
}
