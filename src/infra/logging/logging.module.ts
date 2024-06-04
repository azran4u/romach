import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { AppConfigService } from '../config/app-config/app-config.service';
import { loggerOptionsFactory } from './logger';
import { AppLoggerService } from './app-logger.service';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: (configService: AppConfigService) => {
        const config = configService.get();
        return loggerOptionsFactory(config.logger.name, config.logger.level);
      },
      inject: [AppConfigService],
    }),
  ],
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class LoggingModule {}
