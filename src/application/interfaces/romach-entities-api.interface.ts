import { RegisteredFolderErrorStatus } from '../../domain/entities/RegisteredFolderStatus';
import { FoldersByIdResponse } from '../view-model/folders-by-ids-response';
import { BasicFolder } from '../../domain/entities/BasicFolder';
import { Hierarchy } from '../../domain/entities/Hierarchy';
import { Folder } from '../../domain/entities/Folder';
import { Fail, Ok, Result } from 'rich-domain';

// the interface should be implemented for each reality
export interface RomachEntitiesApiInterface {
  getBasicFoldersByTimestamp(timestamp: string): Promise<Result<BasicFolder[]>>;

  getHierarchies(): Promise<Result<Hierarchy[]>>;

  checkPassword(
    id: string,
    password: string,
  ): Promise<Result<Folder, RegisteredFolderErrorStatus>>;

  getFoldersByIds(
    input: { id: string; password?: string }[],
  ): Promise<Result<FoldersByIdResponse[]>>;
}


