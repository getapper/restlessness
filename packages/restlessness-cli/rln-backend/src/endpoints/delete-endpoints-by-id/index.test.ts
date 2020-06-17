import { StatusCodes, TestHandler } from '@restlessness/core';

const getEndpointsById = 'getEndpointsById';

test('', async (done) => {
  const res = await TestHandler.invokeLambda(getEndpointsById);
  // expect(res.statusCode).toBe(StatusCodes.OK);
  done();
});

/*
afterAll(async done => {
  await mongoDao.closeConnection();
  done();
});
*/
