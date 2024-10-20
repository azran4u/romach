import { AppLoggerService } from "src/infra/logging/app-logger.service";
import { RomachRepositoryInterface } from "../interfaces/romach-repository.interface";
import { FolderChangeDetectionResult } from "./basic-folder-change-detection.service";

export class UpdateBasicFoldersRepositoryService {
    constructor(private readonly repository: RomachRepositoryInterface, private readonly logger: AppLoggerService) { }

    async execute(changes: FolderChangeDetectionResult): Promise<void> {
        this.logger.info('Updating the basic folders repository with changes...');

    }
}
