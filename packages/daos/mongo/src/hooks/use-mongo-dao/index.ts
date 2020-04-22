import mongoDao from '../../dao';

export default async (context: AWSLambda.Context) => mongoDao.openConnection(context);
