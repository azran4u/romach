import { Test, TestingModule } from '@nestjs/testing';
import { FoldersChangeHandlerService } from './basic-folder-replication.service';

describe('BasicFolderReplicationService', () => {
  let service: FoldersChangeHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FoldersChangeHandlerService],
    }).compile();

    service = module.get<FoldersChangeHandlerService>(
      FoldersChangeHandlerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
