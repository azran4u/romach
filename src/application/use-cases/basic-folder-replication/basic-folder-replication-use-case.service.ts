import { EMPTY, catchError, defer, exhaustMap, expand, tap, timer } from 'rxjs';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entities-api.interface';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { EventEmitterInterface } from '../../interfaces/event-handler-interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { RxJsUtils } from '../../../utils/RxJsUtils/RxJsUtils';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { Result } from 'rich-domain';
import { maxBy } from 'lodash';

export class BasicFoldersReplicationUseCase {
  private timestamp: Timestamp;

  constructor(
    private readonly romachApi: RomachEntitiesApiInterface,
    private readonly leaderElection: LeaderElectionInterface,
    private readonly eventEmitter: EventEmitterInterface,
    private interval: number,
    private logger: AppLoggerService,
  ) {
    this.timestamp = Timestamp.ts1970();
  }

  execute() {
    return this.leaderElection.isLeader().pipe(
      RxJsUtils.executeOnTrue(
        timer(0, this.interval).pipe(
          tap((i) => {
            this.logger.debug(`polling basic folders iteration ${i}`);
          }),
          exhaustMap(this.fetcher()),
        ),
      ),
    );
  }

  private fetcher() {
    return () =>
      defer(() => this.fetchBasicFolders()).pipe(
        expand((result) => {
          if (this.stopCondition(result)) {
            return EMPTY;
          } else {
            this.handle(result);
            return defer(() => this.fetchBasicFolders());
          }
        }),
        catchError((error) => {
          this.logger.error(`error fetching basic folders: ${error}`);
          return EMPTY;
        }),
      );
  }

  private async fetchBasicFolders() {
    const foldersResult = await this.romachApi.getBasicFoldersByTimestamp(
      this.timestamp.toString(),
    );
    if (foldersResult.isFail()) {
      throw new Error(foldersResult.error());
    } else {
      this.logger.debug(
        `fetched basic folders from ${this.timestamp.toString()} count ${foldersResult.value().length}`,
      );
      return foldersResult;
    }
  }

  private handle(result: Result<BasicFolder[], string, {}>) {
    const basicFolders = result.value();
    this.logger.debug(`basic folders updated, count ${basicFolders.length}`);
    this.emit(basicFolders);
  }

  private stopCondition(result: Result<BasicFolder[], string, {}>) {
    return result.isOk() && result.value().length === 0;
  }

  private emit(basicFolders: BasicFolder[]) {
    if (basicFolders.length > 0) {
      this.eventEmitter.emit({
        type: 'BASIC_FOLDERS_UPDATED',
        payload: basicFolders,
      });
      this.logger.debug(
        `emitted BASIC_FOLDERS_UPDATED event with entities count ${basicFolders.length}`,
      );
      this.timestamp = Timestamp.fromString(
        this.maxUpdatedAt(basicFolders).getProps().updatedAt,
      );
      this.logger.debug(`new timestamp: ${this.timestamp.toString()}`);
    }
  }
  private maxUpdatedAt(basicFolders: BasicFolder[]) {
    return maxBy(basicFolders, (x) =>
      Timestamp.fromString(x.getProps().updatedAt).toNumber(),
    );
  }
}
