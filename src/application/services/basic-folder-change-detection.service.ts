import { Injectable } from '@nestjs/common';
import { RomachRepositoryInterface } from '../interfaces/romach-repository.interface';
import { AppLoggerService } from '../../infra/logging/app-logger.service';
import { BasicFolder } from '../../domain/entities/BasicFolder';
import { BasicFolderChangeHandlerService } from './basic-folder-change-handler.service';

export interface FolderChangeDetectionResult {
    added: BasicFolder[];
    updated: BasicFolder[];
    deleted: string[];
}

@Injectable()
export class BasicFolderChangeDetectionService {
    constructor(
        private readonly repository: RomachRepositoryInterface,
        private readonly logger: AppLoggerService,
        private readonly basicFolderChangeHandlerService: BasicFolderChangeHandlerService
    ) { }

    async execute(fetchedFolders: BasicFolder[]): Promise<void> {
        this.logger.info('Starting Change Detection');

        const updateFoldersIds = fetchedFolders.map(folder => folder.getProps().id);
        const folderFromRepository = await this.repository.getBasicFolders(updateFoldersIds);

        if (folderFromRepository.isFail()) {
            this.logger.error(`Error fetching existing folders: ${folderFromRepository.error()}`);
            throw new Error(folderFromRepository.error());
        }

        const existingFolders = folderFromRepository.value();

        const changes = this.calculateFolderChanges(fetchedFolders, existingFolders);

        this.logger.info(`Change Detection Result - Added: ${changes.added.length}, Updated: ${changes.updated.length}, Deleted: ${changes.deleted.length}`);
        
        this.basicFolderChangeHandlerService.execute(changes)
    }

    // Calculate which folders were added, updated, or deleted
    private calculateFolderChanges(fetchedFolders: BasicFolder[], existingFolders: BasicFolder[]): FolderChangeDetectionResult {
        const fetchedFolderMap = new Map(fetchedFolders.map(folder => [folder.getProps().id, folder]));
        const existingFolderMap = new Map(existingFolders.map(folder => [folder.getProps().id, folder]));

        const added: BasicFolder[] = [];
        const updated: BasicFolder[] = [];
        const deleted: string[] = [];

        fetchedFolders.forEach(fetchedFolder => {
            const fetchedId = fetchedFolder.getProps().id;
            const existingFolder = existingFolderMap.get(fetchedId);

            if (!existingFolder) {
                added.push(fetchedFolder);
            } else if (fetchedFolder.getProps().updatedAt !== existingFolder.getProps().updatedAt) {
                updated.push(fetchedFolder);
            }
        });

        existingFolders.forEach(existingFolder => {
            const existingId = existingFolder.getProps().id;
            if (!fetchedFolderMap.has(existingId)) {
                deleted.push(existingId);
            }
        });

        return { added, updated, deleted };
    }

}

