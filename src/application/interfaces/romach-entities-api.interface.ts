import { FoldersByIdsResponse } from '../view-model/folders-by-ids-response';
import { BasicFolder } from '../../domain/entities/BasicFolder';
import { Hierarchy } from '../../domain/entities/Hierarchy';
import { Result } from 'rich-domain';

export interface RomachEntitiesApiInterface {
  basicFoldersByTimestamp(timestamp: string): Promise<BasicFolder[]>;
  hierarchies(): Promise<Hierarchy[]>;
  foldersByIds(ids: string[]): Promise<FoldersByIdsResponse>;
  checkPassword(id: string, password: string): Promise<boolean>;
  getProtectedFoldersByIds(
    input: { id: string; password: string }[],
  ): Promise<Result<FoldersByIdsResponse>>;
}
