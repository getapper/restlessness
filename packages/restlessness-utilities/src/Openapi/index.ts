import { promises as fs } from 'fs';
import path from 'path';
import PathResolver from 'root/PathResolver';
import Endpoint from 'root/JsonEndpoint';

export default class Openapi {
  id: number

  static get openapiJsonPath(): string {
    return path.join(PathResolver.getPrjPath, 'openapi.json');
  }

  static getParameters (fields, allKeys, inValue) {
    const fieldsKeys = Object.keys(fields);
    for (let fieldKey of fieldsKeys) {
      if (fields[fieldKey]._type === 'object'){
        allKeys[fieldKey] = {
          type: 'object',
          properties: {},
        };
        Openapi.getParameters(fields[fieldKey].fields, allKeys[fieldKey].properties, inValue);
      } else {
        let type = fields[fieldKey]._type;
        if (fields[fieldKey]._type === 'number') {
          if (fields[fieldKey]._exclusive.integer !== 'undefined') {
            type = 'integer';
          } else {
            type = 'number';
          }
        }
        allKeys.push({
          name: fieldKey,
          type: type,
          in: inValue,
        });
      }
    }
  }

  static getPropertiesRequestBody (fields, allKeys) {
    const fieldsKeys = Object.keys(fields);
    for (let fieldKey of fieldsKeys) {
      if (fields[fieldKey]._type === 'object'){
        allKeys[fieldKey] = {
          type: 'object',
          properties: {},
        };
        Openapi.getPropertiesRequestBody(fields[fieldKey].fields, allKeys[fieldKey].properties);
      } else {
        let type = fields[fieldKey]._type;
        if (fields[fieldKey]._type === 'number') {
          if (fields[fieldKey]._exclusive.integer !== 'undefined') {
            type = 'integer'; 
          } else {
            type = 'number';
          }
        }
        allKeys[fieldKey] = {
          type: type,
        };
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
      components: {
        securitySchemes:{
          JWT: {
            type: 'apiKey',
              in: 'header',
            name: 'authorization',
          },
        },
      },
      security: [{
        JWT: [],
      }],
      paths: {},
    };

    for (let ep of endpoints){
      const routeName = ep.route.endpointRoute;
      const routeMethod = ep.method;
      if (!openapi.paths[routeName]) {
        openapi.paths[routeName] = {};
      }
      openapi.paths[routeName][routeMethod] = {
        description: `${routeMethod}: ${routeName}`,
        tags: ['api'],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                },
              },
            },
          },
        },
      };
      const folderPath = path.join(PathResolver.getDistEndpointsPath, ep.method + '-' +  ep.route.folderName);
      const validationsRoutePath = path.join(folderPath, 'validations');

      try {
        const validationYUP = require(validationsRoutePath).default;

        if (validationYUP.payload) {
          const properties = {};
          Openapi.getPropertiesRequestBody(validationYUP.payload.fields, properties);
          openapi.paths[routeName][routeMethod].requestBody = {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: properties,
                },
              },
            },
          };
        }

        if(validationYUP.pathParameters || validationYUP.queryStringParameters) {
          const parameters = [];
          if (validationYUP.pathParameters) {
            Openapi.getParameters(validationYUP.pathParameters.fields, parameters, 'path');
          }
          if (validationYUP.queryStringParameters) {
            Openapi.getParameters(validationYUP.queryStringParameters.fields, parameters, 'query');
          }
          openapi.paths[routeName][routeMethod].parameters = parameters;
        }
      } catch (e) {
        console.warn(e.message);
      }
    }
    await Openapi.saveOpenapi(openapi);
  }

  static async saveOpenapi(openapi) {
    await fs.writeFile(Openapi.openapiJsonPath, JSON.stringify(openapi, null, 2));
  }
}
