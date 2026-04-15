import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExercisesModule } from './exercises/exercises.module';
import { PrismaModule } from './prisma/prisma.module';
import { RootController } from './root.controller';
import { TestsModule } from './tests/tests.module';

const e2eMinimal = process.env.E2E_MINIMAL === '1';

@Module({
  controllers: [RootController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...(e2eMinimal
      ? [ExercisesModule]
      : [
          PrismaModule,
          ExercisesModule,
          TestsModule,
        ]),
  ],
})
export class AppModule {}
