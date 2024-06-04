import { Test, TestingModule } from '@nestjs/testing';
import { HierarchyLeaderElectionService } from './hierarchy-leader-election.service';

describe('HierarchyLeaderElectionService', () => {
  let service: HierarchyLeaderElectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HierarchyLeaderElectionService],
    }).compile();

    service = module.get<HierarchyLeaderElectionService>(HierarchyLeaderElectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
