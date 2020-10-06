import 'module-alias/register';
import postEndpoints from 'root/endpoints/post-endpoints';
import getEndpoints from 'root/endpoints/get-endpoints';
import postModels from 'root/endpoints/post-models';
import getModels from 'root/endpoints/get-models';
import getDaos from 'root/endpoints/get-daos';
import getEnvs from 'root/endpoints/get-envs';
import postEnvs from 'root/endpoints/post-envs';
import getOpenapi from 'root/endpoints/get-openapi';
import getPlugins from 'root/endpoints/get-plugins';
import getAuthorizers from 'root/endpoints/get-authorizers';
import getEndpointsById from 'root/endpoints/get-endpoints-by-id';
import deleteEndpointsById from 'root/endpoints/delete-endpoints-by-id';
import putEndpointsById from 'root/endpoints/put-endpoints-by-id';
import getServices from 'root/endpoints/get-services';
import getServicesByName from 'root/endpoints/get-services-by-name';

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
  getServices,
  getServicesByName,
};

