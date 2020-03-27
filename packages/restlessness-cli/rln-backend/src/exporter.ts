require('module-alias/register');
import postEndpoints from 'root/endpoints/post-endpoints';
import getEndpoints from 'root/endpoints/get-endpoints';
import postModels from 'root/endpoints/post-models';
import getModels from 'root/endpoints/get-models';
import getDaos from 'root/endpoints/get-daos';
import getOpenapi from 'root/endpoints/get-openapi';
import getEnvs from 'root/endpoints/get-envs';
import postEnvs from 'root/endpoints/post-envs';

export {
  postEndpoints,
  getEndpoints,
  postModels,
  getModels,
  getDaos,
  getOpenapi,
  getEnvs,
  postEnvs,
};

