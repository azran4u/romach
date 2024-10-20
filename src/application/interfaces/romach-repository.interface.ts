import { FoldersByIdResponse } from '../view-model/folders-by-ids-response';
import { RegisteredFolder } from '../../domain/entities/RegisteredFolder';
import { Hierarchy } from '../../domain/entities/Hierarchy';
import { Result } from 'rich-domain';
import { Folder } from 'src/domain/entities/Folder';
import { BasicFolder } from 'src/domain/entities/BasicFolder';

export interface RomachRepositoryInterface {
  saveHierarchies(hierarchy: Hierarchy[]): Promise<void>;
  getHierarchies(): Promise<Result<Hierarchy[]>>;
  saveFolderByIds(folderByIdsResponse: FoldersByIdResponse): Promise<void>;
  getFoldersByIds(ids: string[]): Promise<Result<FoldersByIdResponse>>;
  getBasicFolders(ids: string[]): Promise<Result<BasicFolder[]>>;
  getRegisteredFoldersByUpn(upn: string): Promise<Result<string[]>>;
  upsertRegisteredFolders(folders: RegisteredFolder[]): Promise<Result<void>>;
  updateFolderForAllUsers(folder: Folder): Promise<void>;
  findUniquePasswordsForFolder(folderId: string): Promise<string[]>;
  updateFolderForUsersWithPassword(folder: Folder, password: string): Promise<void>;
  markPasswordInvalidForUsers(folderId: string, password: string): Promise<void>;
}