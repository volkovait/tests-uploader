import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ExercisesService,
  type CheckSampleBody,
  type CheckSampleResponse,
  type PublicSampleTest,
} from './exercises.service';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercises: ExercisesService) {}

  @Get('sample')
  getSample(): PublicSampleTest {
    return this.exercises.getSampleTest();
  }

  @Post('sample/check')
  checkSample(@Body() body: CheckSampleBody): CheckSampleResponse {
    return this.exercises.checkSampleTest(body);
  }
}
