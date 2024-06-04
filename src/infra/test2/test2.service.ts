import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppLoggerService } from '../logging/app-logger.service';
import { LeaderElectionCoreService } from '../leader-election/leader-election/leader-election-core.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class Test2Service implements OnModuleInit {
  constructor(
    private leaderElectionService: LeaderElectionCoreService,
    private readonly logger: AppLoggerService,
  ) {}

  onModuleInit() {
    // this.run();
  }

  run() {
    const processId = uuid();
    this.leaderElectionService
      .startElection({
        task: 'task',
        lockRenewInSeconds: 1,
        lockTimeoutInSeconds: 2,
        processId,
      })
      .catch((err) => this.logger.error(err));

    setInterval(async () => {
      if (this.leaderElectionService.isLeader()) {
        this.logger.info(`LeaderElection ${processId} is leader`);
      } else {
        this.logger.info(`LeaderElection ${processId} is not leader`);
      }
    }, 5000);
  }
}
