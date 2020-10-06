import { StatusCodes, TestHandler } from '@restlessness/core';

const getServices = 'getServices';

beforeAll(async done => {
  await TestHandler.beforeAll();
  done();
});

describe('getServices API', () => {
  test('', async (done) => {
    
    const res = await TestHandler.invokeLambda(getServices);
    // expect(res.statusCode).toBe(StatusCodes.OK);
    done();
  });
});

afterAll(async done => {
  await TestHandler.afterAll();
  done();
});
