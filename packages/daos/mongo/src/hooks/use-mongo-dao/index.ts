import mongoDao from '../../dao';

export default async () => mongoDao.openConnection();
