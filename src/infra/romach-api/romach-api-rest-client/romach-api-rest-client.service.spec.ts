import { Test, TestingModule } from '@nestjs/testing';
import { RomachApiRestClientService } from './romach-api-rest-client.service';

describe('RomachApiRestClientService', () => {
  let service: RomachApiRestClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RomachApiRestClientService],
    }).compile();

    service = module.get<RomachApiRestClientService>(
      RomachApiRestClientService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
