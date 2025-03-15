
export enum ENV_TYPE {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test'
};

export abstract class Config {
  public sitename: string;
  public serviceRegistryUrl: string = "http://localhost:5001";
  public serviceVersion: string = '1.x.x';
}

class DevelopmentConfig extends Config {
  constructor() {
    super();
    this.sitename = 'Art Meetups [Development]';
  }
}

class ProductionConfig extends Config {
  constructor() {
    super();
    this.sitename = 'Art Meetups';
  }
}

const config = process.env.NODE_ENV === ENV_TYPE.PRODUCTION ? new ProductionConfig() : new DevelopmentConfig();

export default config;
