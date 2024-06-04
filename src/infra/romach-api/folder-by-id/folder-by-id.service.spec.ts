import { Test, TestingModule } from '@nestjs/testing';
import { FolderByIdService } from './folder-by-id.service';

describe('FolderByIdService', () => {
  let service: FolderByIdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FolderByIdService],
    }).compile();

    service = module.get<FolderByIdService>(FolderByIdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
