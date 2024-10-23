import { RomachEntitiesApiInterface } from '../../interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from '../../interfaces/romach-repository.interface';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { RxJsUtils } from '../../../utils/RxJsUtils/RxJsUtils';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { FlowUtils } from '../../../utils/FlowUtils/FlowUtils';
import { Result } from 'rich-domain';
import { reduce } from 'lodash';
import { of } from 'rxjs';
import { RetryUtils } from '../../../utils/RetryUtils/RetryUtils';

export interface BasicFoldersReplicationUseCaseOptions {
  romachApi: RomachEntitiesApiInterface;
  romachRepository: RomachRepositoryInterface;
  leaderElection: LeaderElectionInterface;
  pollInterval: number;
  retryInterval: number;
  maxRetry: number;
  handler: (
    basicFolders: BasicFolder[],
  ) => Result<void> | Promise<Result<void>>;
  logger: AppLoggerService;
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
      // TODO: refactor to use retry
      const currentTimestampResult =
        await this.options.romachRepository.getBasicFoldersTimestamp();

      if (currentTimestampResult.isFail()) {
        this.options.logger.error(
          `error getting basic folders timestamp: ${currentTimestampResult.error()}`,
        );
        await FlowUtils.delay(this.options.retryInterval);
        continue;
      }

      this.timestamp = currentTimestampResult.value() ?? Timestamp.ts1970();

      const result = await this.fetchBasicFolders();
      if (result.isFail()) {
        await FlowUtils.delay(this.options.retryInterval);
        continue;
      }

      const basicFolders = result.value();

      const handlerResult = await this.options.handler(basicFolders);

      if (handlerResult.isFail()) {
        await FlowUtils.delay(this.options.retryInterval);
        continue;
      }

      const nextTimestamp = this.nextTimestamp(basicFolders);

      // TODO: refactor to use retry
      const saveTimestampResult =
        await this.options.romachRepository.saveBasicFoldersTimestamp(
          nextTimestamp,
        );

      if (saveTimestampResult.isFail()) {
        this.options.logger.error(
          `error saving basic folders timestamp: ${saveTimestampResult.error()}`,
        );
        await FlowUtils.delay(this.options.retryInterval);
        continue;
      }

      this.timestamp = nextTimestamp;

      await FlowUtils.delay(this.options.pollInterval);
    }
  }

  private async fetchBasicFolders() {
    const foldersResult = await RetryUtils.retry(
      () =>
        this.options.romachApi.getBasicFoldersByTimestamp(
          this.timestamp.toString(),
        ),
      this.options.maxRetry,
      this.options.logger,
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

  private isOkAndEmpty(result: Result<BasicFolder[], string, {}>) {
    return result.isOk() && result.value().length === 0;
  }

  private nextTimestamp(basicFolders: BasicFolder[]) {
    return reduce(
      basicFolders,
      (acc, curr) => {
        const currTimestamp = Timestamp.fromString(curr.getProps().updatedAt);
        return currTimestamp.isAfter(acc) ? currTimestamp : acc;
      },
      this.timestamp,
    );
  }

  
}
