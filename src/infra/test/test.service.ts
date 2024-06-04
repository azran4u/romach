import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '../logging/app-logger.service';
import { LeaderElectionCoreService } from '../leader-election/leader-election/leader-election-core.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TestService {
  constructor(
    private leaderElectionService: LeaderElectionCoreService,
    private readonly logger: AppLoggerService,
  ) {}

  onModuleInit() {
    // this.run().catch((err) => this.logger.error(err));
  }

  async run() {
    const processId = uuid();
    //   const isLeader$ = await this.leaderElectionService.startElection({
    //     task: 'task',
    //     lockRenewInSeconds: 1,
    //     lockTimeoutInSeconds: 2,
    //     processId,
    //   });

    //   isLeader$.subscribe((isLeader) => {
    //     if (isLeader) {
    //       this.logger.info(`LeaderElection ${processId} is leader`);
    //     } else {
    //       this.logger.info(`LeaderElection ${processId} is not leader`);
    //     }
    //   });
  }
}
