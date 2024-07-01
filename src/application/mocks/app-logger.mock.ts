import { AppLoggerService } from '../../infra/logging/app-logger.service';

export function mockAppLoggerServiceBuilder(options?: {
  debug?: boolean;
  print?: boolean;
}): AppLoggerService {
  const enableDebug = options?.debug ?? false;
  const print = options?.print ?? false;
  // @ts-ignore
  return {
    info: (message, meta) => {
      const timestamp = new Date().toISOString();
      if (print) {
        console.log(
          `${timestamp} ${message} ${meta ? JSON.stringify(meta) : ''}`,
        );
      }
    },
    error: console.error,
    debug: enableDebug ? console.debug : jest.fn(),
  };
}
