import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import { Endpoint, Dao, Authorizer } from '../../models';
import { JsonServices, Project } from '@restlessness/core';

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

    const { org, app, region } = payload;

    await JsonServices.read();
    JsonServices.setOrganization(org);
    JsonServices.setApp(app);
    JsonServices.setRegion(region);
    await JsonServices.save();
    await JsonServices.read();

    return ResponseHandler.json({
      org: JsonServices.sharedService.provider.org,
      app: JsonServices.sharedService.provider.app,
      region: JsonServices.sharedService.provider.region,
    });
  } catch (e) {
    console.error(e);
    return ResponseHandler.json({}, StatusCodes.InternalServerError);
  }
};
