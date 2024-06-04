import { Test, TestingModule } from '@nestjs/testing';
import { FolderUpdaterService } from './folder-updater.service';

describe('FolderUpdaterService', () => {
  let service: FolderUpdaterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FolderUpdaterService],
    }).compile();

    service = module.get<FolderUpdaterService>(FolderUpdaterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
