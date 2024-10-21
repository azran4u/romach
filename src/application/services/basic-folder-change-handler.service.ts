import { AppLoggerService } from "src/infra/logging/app-logger.service";
import { FolderChangeDetectionResult } from "./basic-folder-change-detection.service";
import { BasicFolder } from "src/domain/entities/BasicFolder";
import { UpdateBasicFoldersRepositoryService } from "./update-basic-folder-repository.service";
import { FoldersService } from "./folders.service";
import { TreeCalculationHandlerService } from "./tree-calculation-handler.service";

export class BasicFolderChangeHandlerService {
    constructor(
        private readonly logger: AppLoggerService,
        private readonly foldersService: FoldersService,
        private readonly updateBasicFoldersRepositoryService: UpdateBasicFoldersRepositoryService,
        private readonly TreeCalculatorService: TreeCalculationHandlerService
    ) { }

    async execute(changes: FolderChangeDetectionResult): Promise<void> {
        this.logger.info('Handling folder changes...');

        // Step 1: Handle added folders
        await this.updateBasicFolderService(changes.added);

        // Step 2: Handle updated folders
        await this.folders();

        // Step 3: Handle deleted folders
        await this.treeCalculator();

        this.logger.info('Basic folders repository update completed.');
    }

    private async updateBasicFolderService(updatedFolders: BasicFolder[]): Promise<void> {
        if (updatedFolders.length > 0) {
            this.logger.info(`Updating ${updatedFolders.length} folders`);
            try {
                await this.updateBasicFoldersRepositoryService.execute(updatedFolders);
                this.logger.info(`Successfully updated ${updatedFolders.length} folders.`);
            } catch (error) {
                this.logger.error(`Error updating folders: ${error.message}`);
                throw error;
            }
        }
    }

    // Step 1: Handle added folders
    private async folders(): Promise<void> {
        this.foldersService.execute()
    }

    private async treeCalculator(): Promise<void> {
        this.TreeCalculatorService.execute();
    }
}
