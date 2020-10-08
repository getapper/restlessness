import { JsonServices } from '@restlessness/core';
import Endpoint from '../../models/Endpoint';

export default class Service {
  id: string

  static async addService(serviceName: string) {
    await JsonServices.read();
    await JsonServices.addService(serviceName);
    await JsonServices.save();
    return this.getService(serviceName);
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

  static async renameService(serviceName: string, newServiceName) {
    await JsonServices.read();
    await JsonServices.renameService(serviceName, newServiceName);
    await JsonServices.save();

    const endpoints = await Endpoint.getList();
    await Promise.all(endpoints
      .filter(e => e.serviceName === serviceName)
      .map(e => {
        e.serviceName = newServiceName;
        return e.update();
      }));
  }

  static async getService(serviceName) {
    await JsonServices.read();
    return {
      ...JsonServices.services[serviceName],
      service: serviceName,
    };
  }

  static async getServiceNameList(): Promise<Service[]> {
    await JsonServices.read();
    return Object.keys(JsonServices.services)
      .filter(s => s !== JsonServices.OFFLINE_SERVICE_NAME)
      .filter(s => s !== JsonServices.SHARED_SERVICE_NAME)
      .map(s => ({
        id: s,
      }));
  }
};
