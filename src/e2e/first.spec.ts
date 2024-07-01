import { AppConfigService } from '../infra/config/app-config/app-config.service';
import { LoginResponse } from '../application/entities/login-response';
import { RomachConfig } from '../infra/config/configuration';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import nock from 'nock';

describe('e2e', () => {
  let app: INestApplication<any>;
  let configService: AppConfigService;
  let romachConfig: RomachConfig;
  let loginInterceptor: nock.Scope;
  let refreshInterceptor: nock.Scope;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    process.env.ROMACH_REFRESH_TOKEN_API_INTERVAL = '1s';
    app = moduleFixture.createNestApplication();
    configService = app.get(AppConfigService);
    romachConfig = configService.get().romach;

    loginInterceptor = nock(romachConfig.loginApi.url)
      .post('')
      .times(1)
      .reply(200, {
        success: true,
        tokenSet: {
          accessToken: 'mockAccessToken',
          refreshToken: 'mockRefreshToken',
        },
      } as LoginResponse);

    refreshInterceptor = nock(romachConfig.refreshTokenApi.url)
      .post('')
      .reply(200, {
        success: true,
        tokenSet: {
          accessToken: 'mockAccessToken',
          refreshToken: 'mockRefreshToken',
        },
      } as LoginResponse);

    await app.init();
  });

  it('e2e', async () => {
    expect(loginInterceptor.isDone()).toBe(true);
  });

  afterAll(async () => {
    nock.cleanAll();
    await app.close();
  });
});
