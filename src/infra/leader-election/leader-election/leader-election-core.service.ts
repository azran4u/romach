import { Injectable, Scope } from '@nestjs/common';
import { AppLoggerService } from '../../logging/app-logger.service';
import { Knex } from 'knex';
import { AppConfigService } from '../../config/app-config/app-config.service';
import { InjectKnex } from 'nestjs-knex';
import { v4 as uuid } from 'uuid';
import { BehaviorSubject } from 'rxjs';
import { LeaderElectionOptions } from '../../../application/interfaces/leader-election.interface';
const LEADER_ELECTION_TABLE_NAME = 'leader_election';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class LeaderElectionCoreService {
  private enabled = false;
  private _isLeader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false,
  );

  constructor(
    @InjectKnex() public readonly knex: Knex,
    private readonly logger: AppLoggerService,
    private configService: AppConfigService,
  ) {
    this.enabled = false;
  }

  async startElection(options: LeaderElectionOptions) {
    const {
      task,
      processId = uuid(),
      schema = 'public',
      lockRenewInSeconds = 5,
      lockTimeoutInSeconds = 10,
    } = options;
    await this.craeteTable(schema);
    this.enabled = true;
    this.tryToBecomeLeader(
      schema,
      task,
      processId,
      lockRenewInSeconds,
      lockTimeoutInSeconds,
    );
  }
  isLeader() {
    return this._isLeader$.getValue();
  }

  isLeader$() {
    return this._isLeader$.asObservable();
  }

  async stopElection() {
    this.enabled = false;
  }

  private async craeteTable(schema: string) {
    const hasTable = await this.knex.schema
      .withSchema(schema)
      .hasTable(LEADER_ELECTION_TABLE_NAME);
    if (hasTable) {
      return;
    }
    await this.knex.schema
      .withSchema(schema)
      .createTable(LEADER_ELECTION_TABLE_NAME, (table) => {
        table.text('task').notNullable().primary();
        table.text('process_id').notNullable();
        table.timestamp('last_updated').notNullable();
      });
  }
  private async tryToBecomeLeader(
    schema: string,
    task: string,
    processId: string,
    lockRenewInSeconds: number,
    lockTimeoutInSeconds: number,
  ) {
    while (this.enabled) {
      try {
        const res = await this.knex.raw(
          `
            INSERT INTO "${schema}"."${LEADER_ELECTION_TABLE_NAME}" 
            (task, process_id, last_updated)
            VALUES ('${task}', '${processId}', NOW())
            ON CONFLICT (task)
            DO UPDATE SET process_id = '${processId}', last_updated = NOW()
            where "${schema}"."${LEADER_ELECTION_TABLE_NAME}".last_updated < NOW() - INTERVAL '${lockTimeoutInSeconds} seconds' or "${schema}"."${LEADER_ELECTION_TABLE_NAME}".process_id = '${processId}';
            `,
        );

        if (res.rowCount === 1) {
          if (this._isLeader$.getValue() === false) {
            this._isLeader$.next(true);
          }
          this.logger.debug(
            `Process ${processId} became the leader for task ${task}`,
          );
        } else {
          throw new Error('Failed to become the leader');
        }
      } catch (err) {
        if (this._isLeader$.getValue() === true) {
          this._isLeader$.next(false);
        }
        this.logger.debug(
          `Process ${processId} failed to become the leader for task ${task} ${err}`,
        );
      } finally {
        await new Promise((resolve) =>
          setTimeout(resolve, lockRenewInSeconds * 1000),
        );
      }
    }
  }
}
