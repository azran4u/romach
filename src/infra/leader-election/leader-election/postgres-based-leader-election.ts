import { AppLoggerService } from '../../logging/app-logger.service';
import { Knex } from 'knex';
import { v4 as uuid } from 'uuid';
import { BehaviorSubject, Observable, distinctUntilChanged } from 'rxjs';
import {
  LeaderElectionInterface,
  LeaderElectionOptions,
} from '../../../application/interfaces/leader-election.interface';
import { FlowUtils } from '../../../utils/FlowUtils';

export class PostgresBasedLeaderElection implements LeaderElectionInterface {
  private enabled = false;

  private isLeader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false,
  );

  constructor(
    private knex: Knex,
    private logger: AppLoggerService,
    private options: LeaderElectionOptions,
  ) {
    this.enabled = false;
    this.options.processId = this.options.processId ?? uuid();
    this.options.schema = this.options.schema ?? 'public';
    this.options.table = this.options.table ?? 'leader_election';
    this.options.lockRenewInSeconds = this.options.lockRenewInSeconds ?? 1;
    this.options.lockTimeoutInSeconds = this.options.lockTimeoutInSeconds ?? 2;
  }

  isLeader(): Observable<boolean> {
    return this.isLeader$.asObservable().pipe(distinctUntilChanged());
  }

  stop() {
    this.enabled = false;
  }

  async start() {
    await this.createLeaderElectionTableIfNotExists(this.options.schema);
    this.enabled = true;
    this.tryToBecomeLeader();
  }

  private async createLeaderElectionTableIfNotExists(schema: string) {
    const isTableExists = await this.checkIfLeaderElectionTableExists(schema);
    if (isTableExists) return;
    await this.craeteLeaderElectionTable(schema);
  }

  private async checkIfLeaderElectionTableExists(schema: string) {
    const hasTable = await this.knex.schema
      .withSchema(schema)
      .hasTable(this.options.table);
    return hasTable;
  }

  private async craeteLeaderElectionTable(schema: string) {
    await this.knex.schema
      .withSchema(schema)
      .createTable(this.options.table, (table) => {
        table.text('task').notNullable().primary();
        table.text('process_id').notNullable();
        table.timestamp('last_updated').notNullable();
      });
  }

  private async tryToBecomeLeader() {
    while (this.enabled) {
      try {
        const isSuccess = await this.tryToLockTheDatabaseRow();
        isSuccess ? this.setAsLeader() : this.setAsNotLeader();
      } catch (err) {
        this.setAsNotLeader();
      } finally {
        await FlowUtils.delay(`${this.options.lockRenewInSeconds}s`);
      }
    }
  }

  private async tryToLockTheDatabaseRow(): Promise<boolean> {
    const res = await this.knex.raw(
      `
        INSERT INTO "${this.options.schema}"."${this.options.table}" 
        (task, process_id, last_updated)
        VALUES ('${this.options.task}', '${this.options.processId}', NOW())
        ON CONFLICT (task)
        DO UPDATE SET process_id = '${this.options.processId}', last_updated = NOW()
        where "${this.options.schema}"."${this.options.table}".last_updated < NOW() - INTERVAL '${this.options.lockTimeoutInSeconds} seconds' 
        or "${this.options.schema}"."${this.options.table}".process_id = '${this.options.processId}';
        `,
    );
    return res.rowCount === 1;
  }

  private setAsLeader() {
    this.isLeader$.next(true);

    this.logger.debug(
      `Process ${this.options.processId} became the leader for task ${this.options.task}`,
    );
  }

  private setAsNotLeader() {
    this.isLeader$.next(false);

    this.logger.debug(
      `Process ${this.options.processId} is NOT the leader for task ${this.options.task}`,
    );
  }
}
