import { format, Logger, LoggerOptions, transports } from 'winston';

export function loggerOptionsFactory(name: string, level: string) {
  const options: LoggerOptions = {
    defaultMeta: {
      service: name,
      hostname: process.env.HOSTNAME,
    } as LoggerMetadata,
    transports: [
      new transports.Console({
        format: format.combine(
          format.timestamp(),
          format.colorize(),
          format.printf((info) => {
            const { timestamp, level, message, service, hostname, ...args } =
              info;
            return `${timestamp} [${service}@${hostname}] ${level}: ${message} ${
              Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
            }`;
          }),
        ),
        level,
      }),
    ],
  };
  return options;
}

export interface LoggerMetadata extends Record<string, any> {
  service?: string;
}

export function childLogger(logger: Logger, metadata: LoggerMetadata) {
  const child = logger.child({});
  child.defaultMeta = { ...logger.defaultMeta, ...metadata };
  return child;
}
