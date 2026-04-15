import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
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
            useFactory: (config: ConfigService) => ({
              connection: {
                host: config.get<string>('https://desired-foal-99079.upstash.io'),
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
