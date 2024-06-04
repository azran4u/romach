import { Test, TestingModule } from '@nestjs/testing';
import { LeaderElectionCoreService } from './leader-election-core.service';

describe('LeaderElectionService', () => {
  let service: LeaderElectionCoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeaderElectionCoreService],
    }).compile();

    service = module.get<LeaderElectionCoreService>(LeaderElectionCoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
