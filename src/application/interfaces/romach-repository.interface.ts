import { FoldersByIdsResponse } from '../view-model/folders-by-ids-response';
import { RegisteredFolder } from '../../domain/entities/RegisteredFolder';
import { Hierarchy } from '../../domain/entities/Hierarchy';
import { Result } from 'rich-domain';

export interface RomachRepositoryInterface {
  saveHierarchies(hierarchy: Hierarchy[]): Promise<void>;
  getHierarchies(): Promise<Hierarchy[]>;
  saveFolderByIds(folderByIdsResponse: FoldersByIdsResponse): Promise<void>;
  getFoldersByIds(ids: string[]): Promise<Result<FoldersByIdsResponse>>;
  getRegisteredFoldersByUpn(upn: string): Promise<Result<string[]>>;
  upsertRegisteredFolders(folders: RegisteredFolder[]): Promise<Result<void>>;
}
