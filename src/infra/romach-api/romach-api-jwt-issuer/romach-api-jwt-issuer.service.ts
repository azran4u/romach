import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config/app-config.service';

@Injectable()
export class RomachApiJwtIssuerService {
  private token: string | undefined;

  constructor(private appConfigService: AppConfigService) {
    this.token = undefined;
  }

  async init(): Promise<void> {
    setInterval(async () => {
      this.token = await this.generateToken();
    }, 1000);
  }
  async getToken(): Promise<string | undefined> {
    return this.token;
  }

  private async generateToken(): Promise<string | undefined> {
    return 'token';
  }
}
