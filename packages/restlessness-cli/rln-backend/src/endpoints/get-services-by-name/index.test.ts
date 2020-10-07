import { StatusCodes, TestHandler } from '@restlessness/core';

const getServicesByName = 'getServicesByName';

beforeAll(async done => {
  await TestHandler.beforeAll();
  done();
});

describe('getServicesByName API', () => {
  test('', async (done) => {
    
    const res = await TestHandler.invokeLambda(getServicesByName);
    // expect(res.statusCode).toBe(StatusCodes.OK);
    done();
  });
});

afterAll(async done => {
  await TestHandler.afterAll();
  done();
});
