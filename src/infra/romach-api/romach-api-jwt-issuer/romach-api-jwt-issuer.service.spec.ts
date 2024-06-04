import { Test, TestingModule } from '@nestjs/testing';
import { RomachApiJwtIssuerService } from './romach-api-jwt-issuer.service';

describe('RomachApiJwtIssuerService', () => {
  let service: RomachApiJwtIssuerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RomachApiJwtIssuerService],
    }).compile();

    service = module.get<RomachApiJwtIssuerService>(RomachApiJwtIssuerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
