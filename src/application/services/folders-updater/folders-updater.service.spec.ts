import { Test, TestingModule } from '@nestjs/testing';
import { FoldersUpdaterService } from './folders-updater.service';

describe('FoldersUpdaterService', () => {
  let service: FoldersUpdaterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FoldersUpdaterService],
    }).compile();

    service = module.get<FoldersUpdaterService>(FoldersUpdaterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
