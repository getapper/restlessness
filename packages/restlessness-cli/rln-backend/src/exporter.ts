import 'module-alias/register';
import postEndpoints from './endpoints/post-endpoints';
import getEndpoints from './endpoints/get-endpoints';
import postModels from './endpoints/post-models';
import getModels from './endpoints/get-models';
import getDaos from './endpoints/get-daos';
import getEnvs from './endpoints/get-envs';
import postEnvs from './endpoints/post-envs';
import getOpenapi from './endpoints/get-openapi';
import getPlugins from './endpoints/get-plugins';
import getAuthorizers from './endpoints/get-authorizers';
import getEndpointsById from './endpoints/get-endpoints-by-id';
import deleteEndpointsById from './endpoints/delete-endpoints-by-id';
import putEndpointsById from 'root/endpoints/put-endpoints-by-id';

export {
  postEndpoints,
  getEndpoints,
  postModels,
  getModels,
  getDaos,
  getEnvs,
  postEnvs,
  getOpenapi,
  getPlugins,
  getAuthorizers,
  getEndpointsById,
  deleteEndpointsById,
  putEndpointsById,
};

