import { StatusCodes, apiCall } from '@restlessness/core';

const getEndpointsById = 'getEndpointsById';

test('', async (done) => {
  const res = await apiCall(getEndpointsById);
  // expect(res.statusCode).toBe(StatusCodes.OK);
  done();
});

/*
afterAll(async done => {
  await mongoDao.closeConnection();
  done();
});
*/
