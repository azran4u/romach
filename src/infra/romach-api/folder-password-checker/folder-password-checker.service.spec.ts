import { Test, TestingModule } from '@nestjs/testing';
import { FolderPasswordCheckerService } from './folder-password-checker.service';

describe('FolderPasswordCheckerService', () => {
  let service: FolderPasswordCheckerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FolderPasswordCheckerService],
    }).compile();

    service = module.get<FolderPasswordCheckerService>(FolderPasswordCheckerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
