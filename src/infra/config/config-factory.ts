import Joi from 'joi';
import ms from 'ms';
import { Configuration } from './configuration';
import { ConfigFactory } from '@nestjs/config';
import { EnvVarUtils } from '../../utils/EnvVarUtils/EnvVarUtils';

export const configFactory: ConfigFactory<{ config: Configuration }> = () => {
  return {
    config: {
      logger: {
        level: EnvVarUtils.getString('LOGGER_LEVEL', 'info'),
        name: EnvVarUtils.getString('LOGGER_NAME', 'romach-service'),
      },
      database: {
        host: EnvVarUtils.getString('DATABASE_HOST', 'localhost'),
        port: EnvVarUtils.getNumber('DATABASE_PORT', 5432),
        user: EnvVarUtils.getString('DATABASE_USER', 'postgres'),
        password: EnvVarUtils.getString(
          'DATABASE_PASSWORD',
          'postgrespassword',
        ),
        database: EnvVarUtils.getString('DATABASE_NAME', 'postgres'),
        schema: EnvVarUtils.getString('DATABASE_SCHEMA', 'public'),
        pool: {
          min: EnvVarUtils.getNumber('DATABASE_POOL_MIN', 2),
          max: EnvVarUtils.getNumber('DATABASE_POOL_MAX', 10),
        },
        logging: {
          logEverySql: EnvVarUtils.getBoolean('DATABASE_LOG_EVERY_SQL', true),
          includeBindings: EnvVarUtils.getBoolean(
            'DATABASE_LOG_INCLUDE_BINDINGS',
            false,
          ),
        },
      },
      server: {
        port: EnvVarUtils.getNumber('SERVER_PORT', 3000),
      },
      jwt: {
        secret: EnvVarUtils.getString('JWT_SECRET'),
      },
      romach: {
        realities: EnvVarUtils.getStringArray('ROMACH_REALITIES', ['reality1']),
        hierarchy: {
          pollInterval: EnvVarUtils.getMs(
            'ROMACH_HIERARCHY_POLL_INTERVAL',
            '2s',
          ),
        },
        entitiesApi: {
          url: EnvVarUtils.getString('ROMACH_ENTITIES_API_URL'),
          timeout: EnvVarUtils.getNumber(
            'ROMACH_ENTITIES_API_TIMEOUT',
            ms('10s'),
          ),
        },
        tokenApi: {
          url: EnvVarUtils.getString('ROMACH_TOKEN_API_URL'),
          clientId: EnvVarUtils.getString('ROMACH_TOKEN_API_CLIENT_ID'),
          clientSecret: EnvVarUtils.getString('ROMACH_TOKEN_API_CLIENT_SECRET'),
          timeout: EnvVarUtils.getNumber('ROMACH_TOKEN_API_TIMEOUT', ms('10s')),
          interval: EnvVarUtils.getNumber(
            'ROMACH_TOKEN_API_INTERVAL',
            ms('1h'),
          ),
        },
        basicFolder: {
          pollInterval: EnvVarUtils.getNumber(
            'ROMACH_BASIC_FOLDER_POLL_INTERVAL',
            ms('1m'),
          ),
        },
      },
    },
  };
};
export const configValidationSchema = Joi.object<Configuration>({
  database: Joi.object({
    host: Joi.string().required(),
    port: Joi.number().required(),
    user: Joi.string().required(),
    password: Joi.string().required(),
    database: Joi.string().required(),
  }),
  server: Joi.object({
    port: Joi.number().required(),
  }),
  jwt: Joi.object({
    secret: Joi.string().required(),
  }),
  romach: Joi.object({
    entitiesApi: Joi.object({
      url: Joi.string().required(),
      timeout: Joi.number().required().default(ms('10s')),
    }),
    tokenApi: Joi.object({
      url: Joi.string().required(),
      clientId: Joi.string().required(),
      clientSecret: Joi.string().required(),
      timeout: Joi.number().required().default(ms('10s')),
      interval: Joi.number().required().default(ms('1h')),
    }),
    basicFolder: Joi.object({
      pollInterval: Joi.number().required().default(ms('1m')),
    }),
  }),
});
