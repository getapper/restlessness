import { StatusCodes, TestHandler } from '@restlessness/core';

const putEndpointsById = 'putEndpointsById';

beforeAll(async done => {
  await TestHandler.beforeAll();
  done();
});

describe('putEndpointsById API', () => {
  test('', async (done) => {
    
    const res = await TestHandler.invokeLambda(putEndpointsById);
    // expect(res.statusCode).toBe(StatusCodes.OK);
    done();
  });
});

afterAll(async done => {
  await TestHandler.afterAll();
  done();
});
