import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Exercises (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /exercises/sample returns test without answers', () => {
    return request(app.getHttpServer())
      .get('/exercises/sample')
      .expect(200)
      .expect((res) => {
        expect(res.body.questions).toHaveLength(5);
        expect(res.body.questions[0]).not.toHaveProperty('correctChoiceId');
      });
  });

  it('POST /exercises/sample/check scores answers', () => {
    return request(app.getHttpServer())
      .post('/exercises/sample/check')
      .send({
        answers: {
          q1: 'b',
          q2: 'a',
          q3: 'b',
          q4: 'c',
          q5: 'b',
        },
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.score).toBe(5);
        expect(res.body.total).toBe(5);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
