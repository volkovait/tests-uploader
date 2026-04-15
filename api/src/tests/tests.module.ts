import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
import { TestStorageService } from './test-storage.service';
import { ParseTestProcessor } from './parse-test.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'parse-test' })],
  controllers: [TestsController],
  providers: [TestsService, TestStorageService, ParseTestProcessor],
})
export class TestsModule {}
