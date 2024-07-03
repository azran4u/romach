import { AppConfigService } from '../infra/config/app-config/app-config.service';
import { LoginResponse } from '../application/entities/login-response';
import { AppLoggerService } from '../infra/logging/app-logger.service';
import { DockerComposeUtil } from '../utils/DockerComposeUtil/DockerComposeUtil';
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
  let logger: AppLoggerService;
  let dockerComposeUtil = new DockerComposeUtil(
    '/Users/eyalazran/dev/romach/docker-compose.yaml',
  );

  beforeAll(async () => {
    await dockerComposeUtil.start();
    console.log(`docker compose started`);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    process.env.ROMACH_REFRESH_TOKEN_API_INTERVAL = '1s';
    app = moduleFixture.createNestApplication();
    configService = app.get(AppConfigService);
    logger = app.get(AppLoggerService);
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
  }, 40000);

  it('e2e', async () => {
    await app.close();
    logger.info(`closed app`);
    // expect(loginInterceptor.isDone()).toBe(true);
  }, 40000);

  afterAll(async () => {
    nock.cleanAll();
    console.log(`nock cleaned`);
    await dockerComposeUtil.stop();
    console.log(`docker compose stopped`);
  }, 20000);
});
