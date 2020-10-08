import { StatusCodes, TestHandler } from '@restlessness/core';

const postServices = 'postServices';

beforeAll(async done => {
  await TestHandler.beforeAll();
  done();
});

describe('postServices API', () => {
  test('', async (done) => {
    
    const res = await TestHandler.invokeLambda(postServices);
    // expect(res.statusCode).toBe(StatusCodes.OK);
    done();
  });
});

afterAll(async done => {
  await TestHandler.afterAll();
  done();
});
