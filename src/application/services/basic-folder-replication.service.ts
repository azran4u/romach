import { Result } from 'rich-domain';
import { reduce } from 'lodash';
import { of } from 'rxjs';
import { RomachEntitiesApiInterface } from '../interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from '../interfaces/romach-repository.interface';
import { LeaderElectionInterface } from '../interfaces/leader-election.interface';
import { AppLoggerService } from 'src/infra/logging/app-logger.service';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Timestamp } from 'src/domain/entities/Timestamp';
import { RxJsUtils } from 'src/utils/RxJsUtils/RxJsUtils';
import { FlowUtils } from 'src/utils/FlowUtils/FlowUtils';
import { BasicFolderChangeDetectionService } from './basic-folder-change-detection.service';
import { RetryUtils } from 'src/utils/RetryUtils/RetryUtils';


export interface BasicFoldersReplicationOptions {
    romachApi: RomachEntitiesApiInterface;
    romachRepository: RomachRepositoryInterface;
    leaderElection: LeaderElectionInterface;
    interval: number;
    maxRetry: number;
    logger: AppLoggerService;
}

export class BasicFolderReplicationService {
    private timestamp: Timestamp;

    constructor(private options: BasicFoldersReplicationOptions,
        private basicFolderChangeDetectionService: BasicFolderChangeDetectionService,
        private readonly retryUtils: RetryUtils
    ) {
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

            this.basicFolderChangeDetectionService.execute(result.value())
            this.timestamp = this.nextTimestamp(result.value());
        }
    }

    private async fetchBasicFolders() {
        const foldersResult = await this.retryUtils.retry(
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
}

