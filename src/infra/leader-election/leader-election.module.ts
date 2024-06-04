import { Module } from '@nestjs/common';
import { LeaderElectionCoreService } from './leader-election/leader-election-core.service';
import { HierarchyLeaderElectionService } from './hierarchy-leader-election/hierarchy-leader-election.service';

@Module({
  providers: [LeaderElectionCoreService, HierarchyLeaderElectionService],
  exports: [LeaderElectionCoreService],
})
export class LeaderElectionModule {}
