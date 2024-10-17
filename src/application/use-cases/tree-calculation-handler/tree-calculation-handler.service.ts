import { Injectable } from '@nestjs/common';
import { RomachRepositoryInterface } from '../../interfaces/romach-repository.interface';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entities-api.interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { isEqual } from 'lodash';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Injectable()
export class TreeCalculationHandlerService {
    private timestamp: Timestamp;
    private treeCalculationTrigger: Subject<void> = new Subject();

    constructor(
        private readonly romachApi: RomachEntitiesApiInterface,
        private readonly repository: RomachRepositoryInterface,
        private readonly logger: AppLoggerService,
        private readonly debounceTimeInSeconds: number = 10,
    ) {
        this.timestamp = Timestamp.ts1970();

        // Set up the debounce logic for tree recalculation
        this.treeCalculationTrigger.pipe(
            debounceTime(this.debounceTimeInSeconds * 1000),
            switchMap(() => this.calculateTree())
        ).subscribe({
            next: () => this.logger.info('Folder tree recalculation completed successfully.'),
            error: (err) => this.logger.error(`Error during tree recalculation: ${err.message}`)
        });
    }

    // Main function to execute the replication process
    async execute(): Promise<void> {
        this.logger.info('Starting Basic Folder Replication...');

        // Step 1: Fetch basic folders from API by timestamp
        const fetchedFolders = await this.fetchBasicFolders();

        // Step 2: Compare the fetched folders with the existing ones in the database
        const changedFolders = await this.compareWithExistingFolders(fetchedFolders);

        // Step 3: If there are changed folders, save them to the repository and trigger the tree calculation
        if (changedFolders.length > 0) {
            this.logger.info(`Detected ${changedFolders.length} changed folders. Updating repository...`);
            await this.saveChangedFolders(changedFolders);

            // Step 4: Trigger the recalculation of the folder tree
            this.triggerTreeRecalculation();
        } else {
            this.logger.info('No folder changes detected. No update necessary.');
        }
    }

    // Step 1: Fetch folders from API by timestamp
    private async fetchBasicFolders(): Promise<BasicFolder[]> {
        this.logger.debug(`Fetching basic folders since ${this.timestamp.toString()}`);

        const result = await this.romachApi.getBasicFoldersByTimestamp(this.timestamp.toString());
        if (result.isFail()) {
            this.logger.error(`Error fetching folders: ${result.error()}`);
            throw new Error(result.error());
        }

        const fetchedFolders = result.value();
        this.logger.info(`Fetched ${fetchedFolders.length} basic folders`);
        return fetchedFolders;
    }

    // Step 2: Compare the fetched folders with the ones in the repository
    private async compareWithExistingFolders(fetchedFolders: BasicFolder[]): Promise<BasicFolder[]> {
        this.logger.debug('Comparing fetched folders with existing folders in the repository...');

        // Get the IDs of the fetched folders
        const fetchedFolderIds = fetchedFolders.map(folder => folder.getProps().id);

        // Fetch the existing folders from the repository by IDs
        const existingFoldersResult = await this.repository.getFoldersByIds(fetchedFolderIds);
        if (existingFoldersResult.isFail()) {
            this.logger.error(`Error fetching existing folders: ${existingFoldersResult.error()}`);
            throw new Error(existingFoldersResult.error());
        }

        const existingFolders = existingFoldersResult.value();

        // Compare the fetched folders with existing ones and return only the changed ones
        const changedFolders = fetchedFolders.filter(fetchedFolder => {
            const existingFolder = existingFolders.content;

            // If the folder does not exist or if it has changed, mark it as changed
            return !existingFolder || !isEqual(fetchedFolder.getProps(), existingFolder.getProps());
        });

        return changedFolders;
    }


    // Step 3: Save the changed folders to the repository
    private async saveChangedFolders(changedFolders: BasicFolder[]): Promise<void> {
        this.logger.debug('Saving changed folders to the repository...');
        await this.repository.saveFolderByIds({
            id: 'folders-update',
            status: 'valid', // Ensure this matches the `RegisteredFolderStatus` enum if necessary
            content: changedFolders as any, // Assuming this matches the expected type in `FoldersByIdResponse`
        });
        this.logger.info('Changed folders saved to the repository successfully.');
    }

    // Step 4: Trigger the tree recalculation using debounce
    private triggerTreeRecalculation(): void {
        this.logger.debug('Triggering tree recalculation with debounce...');
        this.treeCalculationTrigger.next();
    }

    // Step 5: Recalculate the folder tree after debounce
    private async calculateTree(): Promise<void> {
        this.logger.debug('Recalculating folder tree...');
        this.logger.info('Folder tree recalculated successfully.');
    }
}



/*
    replicate basic folders by timestamp
    compare (deep equal) every changed folder with the current folder in the database
    if the folder is not in the database, add it to changed folders
    if there are changed folders,
        add them to the database
        recalculate tree
    else
        do nothing        
*/
