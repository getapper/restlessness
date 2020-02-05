import { promises as fs } from 'fs';
import path from 'path';
import { getPrjRoot, getEndpointsRoot } from 'root/services/path-resolver';
import { handlerTemplate, indexTemplate, interfacesTemplate } from 'root/models/Endpoint/templates';
import { capitalize, camelCaseToDash } from 'root/services/util';

export default class Route {
  params: string[]

  static parseFromText(text: string): Route {
    const route = new Route();
    const params: string[] = text
      .split('/')
      .filter(p => p !== '')
      .map(p => {
        if (p[0] === '{') {
          return '{' + camelCaseToDash(p
            .replace('{', '')
            .replace('}', '')
          ) + '}';
        }
        return p;
      });
    route.params = params;
    return route;
  }

  get endpointRoute(): string {
    return '/' + this.functionPath;
  }

  get folderName(): string {
    const params = [
      ...this.params,
    ];
    const models = params
      .filter(p => p[0] !== '{');
    const variables = params
      .filter(p => p[0] === '{')
      .map(p => p.replace('{', '').replace('}', ''));
    return `${models.join('-')}${variables.length ? '-by-' : ''}${variables.join('-and-')}`;
  }

  get functionName(): string {
    const params = [
      ...this.params,
    ];
    const models = params
      .filter(p => p[0] !== '{')
      .map(p => p
        .split('-')
        .map(p => capitalize(p))
        .join('')
      );
    const variables = params
      .filter(p => p[0] === '{')
      .map(p => p
        .replace('{', '')
        .replace('}', '')
        .split('-')
        .map(p => capitalize(p))
        .join('')
      );
    return `${models.join('')}${variables.length ? 'By' : ''}${variables.join('And')}`;
  }

  get functionPath(): string {
    const params = [
      ...this.params,
    ];
    return params
      .map(p => {
        if (p[0] === '{') {
          return `{${p
            .replace('{', '')
            .replace('}', '')
            .split('-')
            .map((p2, index) => !index ? p2 : capitalize(p2))
            .join('')}}`;
        }
        return p;
      })
      .join('/');
  }

  toString() {
    return this.endpointRoute;
  }

  toJSON() {
    return this.endpointRoute;
  }
}
