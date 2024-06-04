import { Test, TestingModule } from '@nestjs/testing';
import { BasicFolderReplicationService } from './basic-folder-replication.service';

describe('BasicFolderReplicationService', () => {
  let service: BasicFolderReplicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BasicFolderReplicationService],
    }).compile();

    service = module.get<BasicFolderReplicationService>(BasicFolderReplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
