export interface Configuration {
  logger: {
    level: string;
    name: string;
  };
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    schema: string;
    pool: {
      min: number;
      max: number;
    };
    logging: {
      logEverySql: boolean;
      includeBindings: boolean;
    };
  };
  server: {
    port: number;
  };
  jwt: {
    secret: string;
  };
  romach: {
    realities: string[];
    hierarchy: {
      pollInterval: number;
    };
    entitiesApi: {
      url: string;
      timeout: number;
    };
    tokenApi: {
      url: string;
      clientId: string;
      clientSecret: string;
      timeout: number;
      interval: number;
    };
    basicFolder: {
      pollInterval: number;
    };
  };
}
