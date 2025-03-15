require('dotenv').config();
import path from 'path';
import bunyan, { LogLevel } from "bunyan";
import Logger from "bunyan";
import { name, version } from '../../package.json';

export enum ENV_TYPE {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test'
};

const getLogger = (name: string, version: string, level: LogLevel) => (
  bunyan.createLogger({ name: `${name}:${version}`, level })
);

const getLogLevel = (envType: ENV_TYPE): LogLevel => {
  switch (envType) {
    case ENV_TYPE.DEVELOPMENT:
      return 'debug';
    case ENV_TYPE.TEST:
      return 'fatal';
    default:
      return 'info';
  }
};

export abstract class Config {
  public name: string = name;
  public version: string = version;
  public port: number = +process.env.PORT || 3000;
  public data: {
    feedbacks: string,
  };
  public log: Logger;

  constructor(env: ENV_TYPE) {
    this.data = {
      feedbacks: path.join(__dirname, '../data/feedback.json'),
    };
    this.log = getLogger(name, version, getLogLevel(env));
  }
}

class DevelopmentConfig extends Config {
  constructor() {
    super(ENV_TYPE.DEVELOPMENT);
  }
}

class ProductionConfig extends Config {
  constructor() {
    super(ENV_TYPE.PRODUCTION);
  }
}

const config = process.env.NODE_ENV === ENV_TYPE.PRODUCTION ? new ProductionConfig() : new DevelopmentConfig();

export default config;
