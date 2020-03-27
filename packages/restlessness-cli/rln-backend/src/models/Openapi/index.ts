import fsSync, { promises as fs } from 'fs';
import path from 'path';
import { getEndpointsRoot, getPrjRoot, getDistEndpointsRoot } from 'root/services/path-resolver';
import { Endpoint, Route } from 'root/models';
import { reach } from 'yup';

export default class Openapi {
  id: number
  
  static get openapiJsonPath(): string {
    return path.join(getPrjRoot(), 'openapi.json');
  }

  static getFields (fields, allKeys) {
    const fieldsKeys = Object.keys(fields);
    for (let fieldKey of fieldsKeys) {
      if (fields[fieldKey]._type === 'object'){
        allKeys[fieldKey] = {};
        Openapi.getFields(fields[fieldKey].fields, allKeys[fieldKey]);
      } else {
        allKeys[fieldKey] = fields[fieldKey]._type;
      }
    }
  }

  async create() {
    const endpoints = await Endpoint.getList();
    const openapi = {
      openapi: '3.0.0',
      servers: [{
        url: 'http://localhost:4000',
        description: 'local server',
      }],
      info: {
        title: 'RLN Swagger API overview',
        version: '0.0.1',
      },
      paths: {},
    };

    for (let ep of endpoints){
      const routeName = ep.route.endpointRoute;
      const routeMethod = ep.method;
      if (!openapi.paths[routeName]) {
        openapi.paths[routeName] = {};
      }
      openapi.paths[routeName][routeMethod] = {
        description: 'test description',
        tags: ['api'],
      };
      const folderPath = path.join(getDistEndpointsRoot(), ep.method + '-' +  ep.route.folderName);
      const validationsRoutePath = path.join(folderPath, 'validations');

      const validationYUP = require(validationsRoutePath).default;
      const allKeys = {};
      Openapi.getFields(validationYUP, allKeys);
      console.log(allKeys);
      // @TODO: add params, query and payload in allKeys inside openapi.json
    }
    await Openapi.saveOpenapi(openapi);
  }
  
  static async saveOpenapi(openapi) {
    await fs.writeFile(Openapi.openapiJsonPath, JSON.stringify(openapi, null, 2));
  }
}
