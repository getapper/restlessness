import { StatusCodes, TestHandler } from '@restlessness/core';

const putServicesByName = 'putServicesByName';

beforeAll(async done => {
  await TestHandler.beforeAll();
  done();
});

describe('putServicesByName API', () => {
  test('', async (done) => {
    
    const res = await TestHandler.invokeLambda(putServicesByName);
    // expect(res.statusCode).toBe(StatusCodes.OK);
    done();
  });
});

afterAll(async done => {
  await TestHandler.afterAll();
  done();
});
