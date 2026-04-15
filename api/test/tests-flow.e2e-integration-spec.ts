import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './../src/app.module';

describe('Tests upload flow (e2e integration)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('uploads sample_test.txt, publishes, serves exercise and scores check', async () => {
    const samplePath = join(__dirname, '..', '..', 'sample_test.txt');
    const buf = readFileSync(samplePath);

    const upload = await request(app.getHttpServer())
      .post('/tests/upload')
      .set('X-Upload-Secret', process.env.ADMIN_UPLOAD_SECRET ?? '')
      .field('title', 'Integration sample')
      .attach('file', buf, 'sample_test.txt')
      .expect(201);

    const testId = upload.body.id as string;
    expect(testId).toBeTruthy();

    await request(app.getHttpServer())
      .post(`/tests/${testId}/publish`)
      .set('X-Upload-Secret', process.env.ADMIN_UPLOAD_SECRET ?? '')
      .expect(201);

    const ex = await request(app.getHttpServer())
      .get(`/tests/${testId}/exercise`)
      .expect(200);

    expect(ex.body.questions).toHaveLength(5);
    expect(ex.body.questions[0]).not.toHaveProperty('correctChoiceId');

    const check = await request(app.getHttpServer())
      .post(`/tests/${testId}/check`)
      .send({
        answers: {
          q1: 'b',
          q2: 'a',
          q3: 'b',
          q4: 'c',
          q5: 'b',
        },
      })
      .expect(201);

    expect(check.body.score).toBe(5);
  });
});
