import { RomachEntitiesApiInterface } from '../../interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from '../../interfaces/romach-repository.interface';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { EventEmitterInterface } from '../../interfaces/event-handler-interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { RxJsUtils } from '../../../utils/RxJsUtils/RxJsUtils';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { FlowUtils } from '../../../utils/FlowUtils/FlowUtils';
import { Result } from 'rich-domain';
import { reduce } from 'lodash';
import { of } from 'rxjs';

export interface BasicFoldersReplicationUseCaseOptions {
  romachApi: RomachEntitiesApiInterface;
  romachRepository: RomachRepositoryInterface;
  leaderElection: LeaderElectionInterface;
  eventEmitter: EventEmitterInterface;
  interval: number;
  logger: AppLoggerService;
  maxRetry: number;
  handler: (
    basicFolders: BasicFolder[],
  ) => Result<void> | Promise<Result<void>>;
}
export class BasicFoldersReplicationUseCase {
  private timestamp: Timestamp;

  constructor(private options: BasicFoldersReplicationUseCaseOptions) {
    this.timestamp = Timestamp.ts1970();
  }

  execute() {
    return this.options.leaderElection
      .isLeader()
      .pipe(RxJsUtils.executeOnTrue(of(this.replication)));
  }

  private async replication() {
    while (true) {
      const result = await this.fetchBasicFolders();
      if (this.stopCondition(result)) {
        await FlowUtils.delay(this.options.interval);
        continue;
      }

      const saveResult = await this.saveBasicFolders(result.value());
      if (saveResult.isFail()) {
        await FlowUtils.delay(this.options.interval);
        continue;
      }

      const handlerResult = await this.options.handler(result.value());
      if (handlerResult.isFail()) {
        await FlowUtils.delay(this.options.interval);
        continue;
      }

      this.timestamp = this.nextTimestamp(result.value());
    }
  }

  private async fetchBasicFolders() {
    const foldersResult = await this.retry(
      () =>
        this.options.romachApi.getBasicFoldersByTimestamp(
          this.timestamp.toString(),
        ),
      this.options.maxRetry,
    );

    if (foldersResult.isFail()) {
      this.options.logger.error(
        `error fetching basic folders: ${foldersResult.error()}`,
      );
    } else {
      this.options.logger.debug(
        `fetched basic folders from ${this.timestamp.toString()} count ${foldersResult.value().length}`,
      );
      return foldersResult;
    }
  }

  private async saveBasicFolders(basicFolders: BasicFolder[]) {
    const saveResult = await this.retry(
      () => this.options.romachRepository.saveBasicFolders(basicFolders),
      this.options.maxRetry,
    );

    if (saveResult.isFail()) {
      this.options.logger.error(
        `error saving basic folders: ${saveResult.error()}`,
      );
    }

    return saveResult;
  }

  private stopCondition(result: Result<BasicFolder[], string, {}>) {
    return result.isOk() && result.value().length === 0;
  }

  private nextTimestamp(basicFolders: BasicFolder[]) {
    return reduce(
      basicFolders,
      (acc, curr) => {
        const currTimestamp = Timestamp.fromString(curr.getProps().updatedAt);
        return currTimestamp.isAfter(acc) ? currTimestamp : acc;
      },
      Timestamp.ts1970(),
    );
  }

  private async retry<T>(
    fn: () => Promise<Result<T>>,
    maxRetry: number,
  ): Promise<Result<T>> {
    let retryCount = 0;
    while (retryCount < maxRetry) {
      const result = await fn();
      if (result.isOk()) {
        return result;
      } else {
        this.options.logger.error(
          `try #${retryCount} of ${maxRetry} failed with error: ${result.error()}`,
        );
      }
      retryCount++;
    }
    return Result.fail('max retry reached');
  }
}
