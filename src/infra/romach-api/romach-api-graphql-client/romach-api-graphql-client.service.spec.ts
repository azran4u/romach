import { Test } from '@nestjs/testing';
import { RomachApiGraphqlClientService } from './romach-api-graphql-client.service';
import { AppConfigService } from '../../config/app-config/app-config.service';
import { RomachApiJwtIssuerService } from '../romach-api-jwt-issuer/romach-api-jwt-issuer.service';
import nock from 'nock';

describe('RomachApiGraphqlClientService', () => {
  const mockAppConfigService = {
    get: jest.fn().mockReturnValue({
      romach: {
        entitiesApi: {
          url: 'http://api.romach.com/graphql',
          timeout: 1000,
        },
      },
    }),
  };

  const mockRomachJwtService = {
    getToken: jest.fn().mockReturnValue('token'),
  };

  const mockRomachJwtServiceNoToken = {
    getToken: jest.fn().mockReturnValue(undefined),
  };

  async function moduleBuilder(romachApiJwtIssuerService: any) {
    const module = await Test.createTestingModule({
      providers: [
        AppConfigService,
        RomachApiJwtIssuerService,
        RomachApiGraphqlClientService,
      ],
    })
      .overrideProvider(AppConfigService)
      .useValue(mockAppConfigService)
      .overrideProvider(RomachApiJwtIssuerService)
      .useValue(romachApiJwtIssuerService)
      .compile();

    const service = module.get<RomachApiGraphqlClientService>(
      RomachApiGraphqlClientService,
    );
    return { module, service };
  }

  const sharedScope = nock('http://api.romach.com')
    .post('/graphql')
    .matchHeader('Authorization', `Bearer token`);

  it('should send request with correct authorization header', async () => {
    const { module, service } = await moduleBuilder(mockRomachJwtService);
    const scope = sharedScope.reply(200, { data: 'mockData' });
    await service.query('');
    expect(scope.isDone()).toBe(true);
  });

  it('should throw when timeout expired', async () => {
    const { module, service } = await moduleBuilder(mockRomachJwtService);
    const scope = sharedScope.delay(2000).reply(200, { data: 'mockData' });
    await expect(service.query('')).rejects.toThrow();
  });
  it('should throw if there is network error', async () => {
    const { module, service } = await moduleBuilder(mockRomachJwtService);
    const scope = sharedScope.replyWithError('Internal Server Error');
    await expect(service.query('')).rejects.toThrow();
  });

  it('should throw if there is no token', async () => {
    const { module, service } = await moduleBuilder(
      mockRomachJwtServiceNoToken,
    );
    await expect(service.query('')).rejects.toThrow();
  });
});
