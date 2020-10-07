import { StatusCodes, TestHandler } from '@restlessness/core';

const deleteServicesByName = 'deleteServicesByName';

beforeAll(async done => {
  await TestHandler.beforeAll();
  done();
});

describe('deleteServicesByName API', () => {
  test('', async (done) => {
    
    const res = await TestHandler.invokeLambda(deleteServicesByName);
    // expect(res.statusCode).toBe(StatusCodes.OK);
    done();
  });
});

afterAll(async done => {
  await TestHandler.afterAll();
  done();
});
