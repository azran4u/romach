import { RomachApiGraphqlClientService } from '../romach-api-graphql-client/romach-api-graphql-client.service';
import { RomachEntitiesApiInterface } from '../../../application/interfaces/romach-entities-api.interface';
import { FoldersByIdResponse } from '../../../application/view-model/folders-by-ids-response';
import { RegisteredFolderErrorStatus } from '../../../domain/entities/RegisteredFolderStatus';
import { AppLoggerService } from '../../logging/app-logger.service';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { Hierarchy } from '../../../domain/entities/Hierarchy';
import { Folder } from '../../../domain/entities/Folder';
import { Result } from 'rich-domain';

export class RomachEntitiesApiService implements RomachEntitiesApiInterface {
  constructor(
    private romachApiGraphqlClientService: RomachApiGraphqlClientService,
    private logger: AppLoggerService,
  ) {}
  getBasicFoldersByTimestamp(
    timestamp: string,
  ): Promise<Result<BasicFolder[], string, {}>> {
    throw new Error('Method not implemented.');
  }
  getHierarchies(): Promise<Result<Hierarchy[], string, {}>> {
    throw new Error('Method not implemented.');
  }
  checkPassword(
    id: string,
    password: string,
  ): Promise<Result<Folder, RegisteredFolderErrorStatus, {}>> {
    throw new Error('Method not implemented.');
  }
  getFoldersByIds(
    input: { id: string; password?: string }[],
  ): Promise<Result<FoldersByIdResponse[]>> {
    throw new Error('Method not implemented.');
  }
  foldersByIds(ids: string[]): Promise<FoldersByIdResponse> {
    throw new Error('Method not implemented.');
  }
}
