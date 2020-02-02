require('module-alias/register');
import res from 'root/services/response-handler';
import Endpoint from 'root/models/Endpoint';

export default async (event, context) => {
  const endpoints: Endpoint[] = await Endpoint.getList();
  return res(
    endpoints, 200, {
    headers: {
      'Access-Control-Expose-Headers': 'content-range',
      'content-range': `${endpoints.length}`,
    },
  });
};
