import { JsonServices } from '@restlessness/core';
import Endpoint from '../../models/Endpoint';

export default class Service {
  static async addService(serviceName: string) {
    await JsonServices.read();
    await JsonServices.addService(serviceName);
    await JsonServices.save();
  }

  static async removeService(serviceName: string) {
    await JsonServices.read();
    await JsonServices.removeService(serviceName);
    await JsonServices.save();
    // remove endpoints associated to the service
    const endpoints = (await Endpoint.getList())
      .filter(e => e.serviceName === serviceName);
    await Promise.all(endpoints.map(e => e.remove()));
  }

  static async getService(serviceName) {
    await JsonServices.read();
    return JsonServices.services[serviceName];
  }

  static async getServiceNameList(): Promise<string[]> {
    await JsonServices.read();
    return Object.keys(JsonServices.services)
      .filter(s => s !== JsonServices.OFFLINE_SERVICE_NAME)
      .filter(s => s !== JsonServices.SHARED_SERVICE_NAME);
  }
};
