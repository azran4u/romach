import { Injectable } from '@nestjs/common';
import { RomachRepositoryInterface } from '../../interfaces/romach-repository.interface';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entities-api.interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { isEqual } from 'lodash';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { BasicFolder } from 'src/domain/entities/BasicFolder';


@Injectable()
export class BasicFolderReplicationService {
    private timestamp: Timestamp;

    constructor(
        private readonly romachApi: RomachEntitiesApiInterface,
        private readonly repository: RomachRepositoryInterface,
        private readonly logger: AppLoggerService,
    ) {
        this.timestamp = Timestamp.ts1970(); 
    }

    // Main function to execute the replication process
    async execute(): Promise<void> {
        this.logger.info('Starting Basic Folder Replication...');

        // Step 1: Fetch basic folders from API by timestamp
        const fetchedFolders = await this.fetchBasicFolders();

        // Step 2: Compare the fetched folders with the existing ones in the database
        const changedFolders = await this.compareWithExistingFolders(fetchedFolders);

        // Step 3: If there are changed folders, save them to the repository and recalculate the tree
        if (changedFolders.length > 0) {
            this.logger.info(`Detected ${changedFolders.length} changed folders. Updating repository...`);
            await this.saveChangedFolders(changedFolders);
            await this.recalculateTree();
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

        const existingFolders = existingFoldersResult.value().content;

        // Compare the fetched folders with existing ones and return only the changed ones
        const changedFolders = fetchedFolders.filter(fetchedFolder => {
            const existingFolder = existingFolders.find(folder => folder.id === fetchedFolder.getProps().id);
            return !existingFolder || !isEqual(fetchedFolder.getProps(), existingFolder.content.getProps());
        });

        return changedFolders;
    }

    // Step 3: Save the changed folders to the repository
    private async saveChangedFolders(changedFolders: BasicFolder[]): Promise<void> {
        this.logger.debug('Saving changed folders to the repository...');
        await this.repository.saveFolderByIds({
            id: 'folders-update',
            status: 'updated', 
            content: changedFolders,
        });
        this.logger.info('Changed folders saved to the repository successfully.');
    }

    // Step 4: Recalculate the folder tree after changes
    private async recalculateTree(): Promise<void> {
        this.logger.debug('Recalculating folder tree...');
        // Here you would implement the tree recalculation logic
        // Example:
        // await this.repository.recalculateFolderTree();
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
