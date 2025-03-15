import express, { Request, Response } from "express";
import ServiceRegistry from "../logic";
import { Config } from "../utils/config";

const router = express.Router();

const createRegistryRoute = (config: Config) => {
  const serviceRegistry = new ServiceRegistry(config);

  router.get('/find/:serviceName/:serviceVersion', (req: Request, res: Response): void => {
    const { serviceName, serviceVersion } = req.params;
    const service = serviceRegistry.get(serviceName, serviceVersion);
  
    if (!service) {
      res.status(404).json(`Service ${serviceName} not found`);
      config.log.warn(`Service ${serviceName} not found`);
      return;
    }
  
    res.status(200).json(service);
  });
  
  router.put('/register/:serviceName/:serviceVersion/:servicePort', (req: Request, res: Response): void => {
    const { serviceName, serviceVersion, servicePort } = req.params;
    const serviceIp = req.connection.remoteAddress.includes('::') ? `[${req.connection.remoteAddress}]` : req.connection.remoteAddress;
  
    const serviceKey = serviceRegistry.register({
      name: serviceName,
      version: serviceVersion,
      ip: serviceIp,
      port: servicePort,
    });
  
    res.status(200).json({ result: serviceKey });
  });
  
  router.delete('/unregister/:serviceName/:serviceVersion/:servicePort', (req: Request, res: Response) => {
    const { serviceName, serviceVersion, servicePort } = req.params;
    const serviceIp = req.connection.remoteAddress.includes('::') ? `[${req.connection.remoteAddress}]` : req.connection.remoteAddress;
    const serviceKey = serviceRegistry.unregister({
      ip: serviceIp,
      name: serviceName,
      port: servicePort,
      version: serviceVersion
    });
  
    res.json({ result: `Deleted ${serviceKey}` })
  });

  return router;
};

export default createRegistryRoute;
