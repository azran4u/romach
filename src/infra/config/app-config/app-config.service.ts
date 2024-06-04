import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '../configuration';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get(): Configuration {
    return this.configService.get<Configuration>('config');
  }
}
