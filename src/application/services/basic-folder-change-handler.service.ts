import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '../../infra/logging/app-logger.service';
import { FolderChangeDetectionResult } from './basic-folder-change-detection.service';
import { TreeCalculationHandlerService } from '../use-cases/tree-calculation-handler/tree-calculation-handler.service';
import { FoldersService } from './folders.service';
import { UpdateBasicFoldersRepositoryService } from './update-basic-folder-repository.service';

@Injectable()
export class BasicFolderChangesHandlerService {
    constructor(
        private readonly logger: AppLoggerService,
        private readonly updateBasicFoldersRepositoryService: UpdateBasicFoldersRepositoryService,
        private readonly treeCalculationHandlerService: TreeCalculationHandlerService,
        private readonly foldersService: FoldersService
    ) { }

    async handleChanges(changes: FolderChangeDetectionResult): Promise<void> {
        this.logger.info('Handling folder changes');

        await this.updateBasicFoldersRepositoryService.execute(changes);

        await Promise.all([
            this.treeCalculationHandlerService.execute(),
            this.foldersService.execute(changes)
        ]);
    }
}
