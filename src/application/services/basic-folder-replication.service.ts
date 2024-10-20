import { RomachEntitiesApiInterface } from '../interfaces/romach-entities-api.interface';
import { AppLoggerService } from '../../infra/logging/app-logger.service';
import { Timestamp } from '../../domain/entities/Timestamp';
import { BasicFolder } from '../../domain/entities/BasicFolder';

export class BasicFolderReplicationService {
    private timestamp: Timestamp;

    constructor(
        private readonly romachApi: RomachEntitiesApiInterface,
        private readonly logger: AppLoggerService
    ) {
        this.timestamp = Timestamp.ts1970();
    }

    async fetchBasicFolders(): Promise<BasicFolder[]> {
        this.logger.info('Fetching basic folders');
        const result = await this.romachApi.getBasicFoldersByTimestamp(this.timestamp.toString());

        if (result.isFail()) {
            this.logger.error(`Error fetching folders: ${result.error()}`);
            throw new Error(result.error());
        }

        const fetchedFolders = result.value();
        this.logger.info(`Fetched ${fetchedFolders.length} basic folders.`);
        return fetchedFolders;
    }
}   
