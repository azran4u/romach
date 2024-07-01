import { RomachApiRestClientService } from '../romach-api-rest-client/romach-api-rest-client.service';
import { AppConfigService } from '../../config/app-config/app-config.service';
import { LoginResponse } from '../../../application/entities/login-response';
import { RomachRefreshTokenApiConfig } from '../../config/configuration';
import { Injectable } from '@nestjs/common';

export interface RomachRefreshTokenApiRequestBody {
  refreshToken: string;
}

@Injectable()
export class RomachRefreshTokenApiClientService {
  private client: RomachApiRestClientService<
    RomachRefreshTokenApiRequestBody,
    LoginResponse
  >;

  private config: RomachRefreshTokenApiConfig;

  constructor(private configService: AppConfigService) {
    this.config = this.configService.get().romach.refreshTokenApi;
    const url = this.config.url;
    const timeout = this.config.timeout;
    this.client = new RomachApiRestClientService(url, timeout);
  }

  public async refresh(refreshToken: string): Promise<LoginResponse> {
    return this.client.post({
      refreshToken,
    });
  }
}
