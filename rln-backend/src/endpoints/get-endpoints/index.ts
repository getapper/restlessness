require('module-alias/register');
import res from 'root/services/response-handler';

export default (event, context, cb) => {
  return res(cb, [
    {
      route: '/endpoints',
    },
  ], 200, {
    headers: {
      'Access-Control-Expose-Headers': 'content-range',
      'content-range': '10',
    },
  });
};
