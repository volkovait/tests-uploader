import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { buildBullRedisConnection } from './config/bull-redis.config';
import { ExercisesModule } from './exercises/exercises.module';
import { PrismaModule } from './prisma/prisma.module';
import { TestsModule } from './tests/tests.module';

const e2eMinimal = process.env.E2E_MINIMAL === '1';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...(e2eMinimal
      ? [ExercisesModule]
      : [
          BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: () => ({
              connection: {
                url: 'redis://default:gQAAAAAAAYMHAAIncDJlOGM1ODE1YzY0MmE0Yzg0ODAyMmQxZjZkOTRiY2NmOXAyOTkwNzk@desired-foal-99079.upstash.io:6379',
              },
            }),
            inject: [ConfigService],
          }),
          PrismaModule,
          ExercisesModule,
          TestsModule,
        ]),
  ],
})
export class AppModule {}
