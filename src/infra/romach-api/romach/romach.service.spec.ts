import { Test, TestingModule } from '@nestjs/testing';
import { RomachService } from './romach.service';

describe('RomachService', () => {
  let service: RomachService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RomachService],
    }).compile();

    service = module.get<RomachService>(RomachService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
