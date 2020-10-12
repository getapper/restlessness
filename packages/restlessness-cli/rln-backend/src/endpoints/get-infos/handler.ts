import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import { Project } from '@restlessness/core';
import { JsonServices } from '@restlessness/core/dist';

export default async (req: Request) => {
  try {
    const {
      validationResult,
    } = req;

    if (!validationResult.isValid) {
      return ResponseHandler.json({ message: validationResult.message }, StatusCodes.BadRequest);
    }

    await JsonServices.read();

    const { org, app } = JsonServices.sharedService;

    return ResponseHandler.json({
      projectName: await Project.getProjectName(),
      org,
      app,
      region: JsonServices.sharedService.provider.region,
    });
  } catch (e) {
    console.error(e);
    return ResponseHandler.json({}, StatusCodes.InternalServerError);
  }
};
