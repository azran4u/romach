import { AppLoggerService } from "src/infra/logging/app-logger.service";
import { BasicFolder } from "src/domain/entities/BasicFolder";
import { RomachRepositoryInterface } from "../interfaces/romach-repository.interface";

export class UpdateBasicFoldersRepositoryService {
    constructor(
        private readonly repository: RomachRepositoryInterface,
        private readonly logger: AppLoggerService
    ) { }

    async execute(folders: BasicFolder[]): Promise<void> {
        this.logger.info(`Updating ${folders.length} folders in the repository...`);
        try {
            await this.repository.saveBasicFolders(folders);
            this.logger.info('Folders updated successfully in the repository.');
        } catch (error) {
            this.logger.error(`Error updating repository: ${error.message}`);
            throw error;
        }
    }
}