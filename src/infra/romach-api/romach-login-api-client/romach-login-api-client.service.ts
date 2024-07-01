import { RomachApiRestClientService } from '../romach-api-rest-client/romach-api-rest-client.service';
import { AppConfigService } from '../../config/app-config/app-config.service';
import { LoginResponse } from '../../../application/entities/login-response';
import { AppLoggerService } from '../../logging/app-logger.service';
import { RomachLoginApiConfig } from '../../config/configuration';
import { Injectable } from '@nestjs/common';

export interface RomachLoginApiRequestBody {
  clientId: string;
  clientSecret: string;
}

@Injectable()
export class RomachLoginApiClientService {
  private client: RomachApiRestClientService<
    RomachLoginApiRequestBody,
    LoginResponse
  >;

  private config: RomachLoginApiConfig;

  constructor(
    private configService: AppConfigService,
    private logger: AppLoggerService,
  ) {
    this.config = this.configService.get().romach.loginApi;
    const url = this.config.url;
    const timeout = this.config.timeout;
    this.client = new RomachApiRestClientService(url, timeout);
  }

  public async login(): Promise<LoginResponse> {
    this.logger.info(`Logging in to ${this.config.url}...`);
    return this.client.post({
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
    });
  }
}
