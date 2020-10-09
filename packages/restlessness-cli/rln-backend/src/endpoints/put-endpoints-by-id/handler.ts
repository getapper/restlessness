import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import { Endpoint, Dao, Authorizer } from '../../models';

export default async (req: Request) => {
  try {
    const {
      validationResult,
      payload,
      pathParameters,
    } = req;

    if (!validationResult.isValid) {
      return ResponseHandler.json({ message: validationResult.message }, StatusCodes.BadRequest);
    }

    const { id } = pathParameters;
    const { daoIds, authorizerId, warmupEnabled, serviceName } = payload;

    const endpoint = await Endpoint.getById(id);
    if (!endpoint) {
      return ResponseHandler.json({ message: `Cannot find endpoint with id ${id}` }, StatusCodes.BadRequest);
    }

    if (daoIds?.length) {
      endpoint.daos = (await Promise.all(daoIds.map(id => Dao.getById(id)))).filter(d => !!d);
    } else {
      endpoint.daos = [];
    }

    endpoint.authorizer = authorizerId ? await Authorizer.getById(authorizerId) : null;
    endpoint.warmupEnabled = warmupEnabled;
    endpoint.serviceName = serviceName;
    console.log(endpoint);
    await endpoint.update();

    return ResponseHandler.json({ endpoint });
  } catch (e) {
    console.error(e);
    return ResponseHandler.json({}, StatusCodes.InternalServerError);
  }
};
