import { Injectable } from '@nestjs/common';
import { EMPTY, Observable, OperatorFunction, defer, timer, from } from 'rxjs';
import { catchError, concatMap, expand, map, retry, switchMap, tap } from 'rxjs/operators';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from '../../interfaces/romach-repository.interface';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { RxJsUtils } from '../../../utils/RxJsUtils/RxJsUtils';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { maxBy } from 'lodash';
import { FoldersByIdResponse } from '../../view-model/folders-by-ids-response';

export interface BasicFolderReplicationServiceOptions {
    interval: number;
    logger: AppLoggerService;
    romachApi: RomachEntitiesApiInterface;
    repository: RomachRepositoryInterface;
    leaderElection: LeaderElectionInterface;
}

@Injectable()
export class BasicFolderReplicationService {
    private timestamp: Timestamp;

    constructor(private options: BasicFolderReplicationServiceOptions) {
        this.timestamp = Timestamp.ts1970();
    }

    // Main execute function that starts the replication process
    execute(): Observable<unknown> {
        this.options.logger.info(`BasicFolderReplicationService has been initialized`);

        return this.options.leaderElection.isLeader().pipe(
            tap((isLeader) => this.options.logger.info(`Leader Election status: ${isLeader}`)),
            RxJsUtils.executeOnTrue(this.poller())
        );
    }

    // Polling mechanism
    private poller(): Observable<unknown> {
        return timer(0, this.options.interval).pipe(
            tap(() => this.options.logger.debug(`Polling for basic folder replication...`)),
            this.replicationProcess()
        );
    }

    // The actual replication process
    private replicationProcess(): OperatorFunction<unknown, unknown> {
        return (source: Observable<unknown>) =>
            source.pipe(
                this.fetcher(),
                this.compareWithExistingFolders(),
                this.handleChanges(),
                this.saver()
            );
    }

    // Fetch updated folders by timestamp
    private fetcher(): OperatorFunction<unknown, BasicFolder[]> {
        return (source: Observable<unknown>) =>
            source.pipe(
                concatMap(() => this.fetchBasicFolders()),
                retry(2),
                catchError((error) => {
                    this.options.logger.error(`Error fetching folders: ${error.message}`);
                    return EMPTY;
                })
            );
    }

    // Function to fetch basic folders by timestamp
    private async fetchBasicFolders(): Promise<BasicFolder[]> {
        const folderResponse = await this.options.romachApi.getBasicFoldersByTimestamp(this.timestamp.toString());
        if (folderResponse.isFail()) {
            throw new Error(folderResponse.error());
        }
        this.options.logger.debug(`Fetched ${folderResponse.value().length} basic folders`);
        return folderResponse.value();
    }

    // private compareWithExistingFolders(): OperatorFunction<BasicFolder[], BasicFolder[]> {
    //     return (fetchedFolders$: Observable<BasicFolder[]>) =>
    //         fetchedFolders$.pipe(
    //             switchMap((fetchedFolders) =>
    //                 from(this.options.repository.getFoldersByIds(fetchedFolders.map((folder) => folder.getProps().id))).pipe(
    //                     map((repositoryResult) => {
    //                         const existingFolders = repositoryResult.isOk()
    //                             ? (repositoryResult.value() as FoldersByIdResponse).folders
    //                             : [];

    //                         const updatedOrNewFolders = fetchedFolders.filter(
    //                             (fetchedFolder) =>
    //                                 !existingFolders.find(
    //                                     (existingFolder) =>
    //                                         existingFolder.id === fetchedFolder.getProps().id && existingFolder.updatedAt >= fetchedFolder.getProps().updatedAt
    //                                 )
    //                         );
    //                         this.options.logger.debug(`Found ${updatedOrNewFolders.length} changed folders`);
    //                         return updatedOrNewFolders; // Return only folders that need updating
    //                     })
    //                 )
    //             )
    //         );
    // }



    // Handle changes and trigger necessary events or updates
    private handleChanges(): OperatorFunction<BasicFolder[], BasicFolder[]> {
        return (source: Observable<BasicFolder[]>) =>
            source.pipe(
                tap((changedFolders) => {
                    if (changedFolders.length > 0) {
                        this.options.logger.info(`Emitting BASIC_FOLDERS_UPDATED event for ${changedFolders.length} folders`);
                        this.timestamp = Timestamp.fromString(this.maxUpdatedAt(changedFolders).getProps().updatedAt);
                        this.options.logger.debug(`New timestamp: ${this.timestamp.toString()}`);
                    }
                })
            );
    }

    // Save changed folders to the repository
    private saver(): OperatorFunction<BasicFolder[], void> {
        return (source: Observable<BasicFolder[]>) =>
            source.pipe(
                switchMap((changedFolders) => from(this.options.repository.saveFolderByIds(changedFolders))),
                tap(() => this.options.logger.info(`Changed folders saved to repository`)),
                catchError((error) => {
                    this.options.logger.error(`Error saving folders: ${error.message}`);
                    return EMPTY;
                })
            );
    }

    // Helper function to get the folder with the latest updated timestamp
    private maxUpdatedAt(folders: BasicFolder[]): BasicFolder {
        return maxBy(folders, (folder) => Timestamp.fromString(folder.getProps().updatedAt).toNumber()) as BasicFolder;
    }


    /* 
        replicate basic folders by timestamp
        compare (by updatedAt) every changed folder with the current folder in the database
        if the folder is not in the database, add it to changed folders
        if there are changed folders,
            add them to the database
            recalculate tree
        else
            do nothing        
    */
}
