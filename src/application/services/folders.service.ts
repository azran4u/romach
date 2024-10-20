import { AppLoggerService } from "src/infra/logging/app-logger.service";
import { FolderChangeDetectionResult } from "./basic-folder-change-detection.service";

export class FoldersService {
    constructor(private readonly logger: AppLoggerService) { }

    async execute(changes: FolderChangeDetectionResult): Promise<void> {
        this.logger.info('Handling additional folder services with changes...');
    }
}
