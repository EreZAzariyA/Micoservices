require('dotenv').config();
import bunyan, { LogLevel } from "bunyan";
import pjs from '../../package.json';
import Logger from "bunyan";

export enum ENV_TYPE {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test'
};

const { name, version } = pjs;

const getLogger = (name: string, version: string, level: LogLevel) => (
  bunyan.createLogger({ name: `${name}:${version}`, level })
);

const getLogLevel = (envType: ENV_TYPE.DEVELOPMENT | ENV_TYPE.PRODUCTION | ENV_TYPE.TEST) => {
  let logLevel: LogLevel;
  switch(envType) {
    case ENV_TYPE.DEVELOPMENT:
      logLevel = 'debug';
      break;
      case ENV_TYPE.TEST:
        logLevel = 'fatal';
        break;
    default:
      logLevel = 'info';
  };

  return logLevel;
};

export abstract class Config {
  public port: number = +process.env.PORT;
  public serviceTimeout = 30000;
  public log: Logger;
};

class DevelopmentConfig extends Config {
  public constructor() {
    super();
    this.log = getLogger(name, version, getLogLevel(ENV_TYPE.DEVELOPMENT))
  };
};

class ProductionConfig extends Config {
  public constructor() {
    super();
    this.log = getLogger(name, version, getLogLevel(ENV_TYPE.PRODUCTION))
  };
};

const config = process.env.NODE_ENV !== "production" ? new DevelopmentConfig() : new ProductionConfig();

export default config;
