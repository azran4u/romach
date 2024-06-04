import { Injectable } from '@nestjs/common';
import { LeaderElectionBaseService } from '../leader-election-base/leader-election-base.service';

@Injectable()
export class HierarchyLeaderElectionService extends LeaderElectionBaseService {
  async start(): Promise<void> {
    return this.leaderElectionCoreService.startElection({
      task: 'hierarchy-replication',
      lockRenewInSeconds: 1,
      lockTimeoutInSeconds: 2,
    });
  }
}
