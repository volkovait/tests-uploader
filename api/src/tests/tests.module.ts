import { Module } from '@nestjs/common';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
import { TestStorageService } from './test-storage.service';

@Module({
  controllers: [TestsController],
  providers: [TestsService, TestStorageService],
})
export class TestsModule {}
