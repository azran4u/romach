import { Test, TestingModule } from '@nestjs/testing';
import { LeaderElectionBaseService } from './leader-election-base.service';

describe('HierarchyLeaderElectionService', () => {
  let service: LeaderElectionBaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeaderElectionBaseService],
    }).compile();

    service = module.get<LeaderElectionBaseService>(LeaderElectionBaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
