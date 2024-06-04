import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '../../logging/app-logger.service';
import { Knex } from 'knex';
import { InjectKnex } from 'nestjs-knex';
import { LeaderElectionOptions } from '../../../application/interfaces/leader-election.interface';
import { PostgresBasedLeaderElection } from './postgres-based-leader-election';

@Injectable()
export class LeaderElectionFactoryService {
  constructor(
    @InjectKnex() public readonly knex: Knex,
    private readonly logger: AppLoggerService,
  ) {}

  async factory(options: LeaderElectionOptions) {
    return new PostgresBasedLeaderElection(this.knex, this.logger, options);
  }
}
