import { Injectable, Scope } from '@nestjs/common';
import { LeaderElectionCoreService } from '../leader-election/leader-election-core.service';
import {
  LeaderElectionInterface,
  LeaderElectionOptions,
} from '../../../application/interfaces/leader-election.interface';
import { Observable } from 'rxjs';
import { AppLoggerService } from '../../logging/app-logger.service';
import { AppConfigService } from '../../config/app-config/app-config.service';
import { Configuration } from '../../config/configuration';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class LeaderElectionBaseService implements LeaderElectionInterface {
  protected config: Configuration;
  constructor(
    protected leaderElectionCoreService: LeaderElectionCoreService,
    protected readonly logger: AppLoggerService,
    protected readonly configService: AppConfigService,
  ) {
    this.config = this.configService.get();
  }

  async start(options: LeaderElectionOptions): Promise<void> {
    return this.leaderElectionCoreService.startElection(options);
  }

  stop() {
    this.leaderElectionCoreService.stopElection();
  }

  isLeader(): Observable<boolean> {
    return this.leaderElectionCoreService.isLeader$();
  }
}
