import { FoldersByIdResponse } from '../view-model/folders-by-ids-response';
import { RegisteredFolder } from '../../domain/entities/RegisteredFolder';
import { Hierarchy } from '../../domain/entities/Hierarchy';
import { Result } from 'rich-domain';
import { Folder } from 'src/domain/entities/Folder';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Timestamp } from '../../domain/entities/Timestamp';

export interface RomachRepositoryInterface {
  saveHierarchies(hierarchy: Hierarchy[]): Promise<void>;
  saveBasicFoldersTimestamp(timestamp: Timestamp): Promise<Result<void>>;
  getBasicFoldersTimestamp(): Promise<Result<Timestamp | null>>;
  getHierarchies(): Promise<Result<Hierarchy[]>>;
  saveBasicFolders(basicFolder: BasicFolder[]): Promise<Result<FoldersByIdResponse>>;
  saveBasicFoldersById(ids: string[]): Promise<Result<FoldersByIdResponse>>;
  getFoldersByIds(ids: string[]): Promise<Result<FoldersByIdResponse>>;
  deleteBasicFolderByIds(ids: string[]): Promise<Result<FoldersByIdResponse[]>>;
  getBasicFolders(ids: string[]): Promise<Result<BasicFolder[]>>;
  getRegisteredFoldersByUpn(upn: string): Promise<Result<string[]>>;
  upsertRegisteredFolders(folders: RegisteredFolder[]): Promise<Result<void>>;
  updateFolderForAllUsers(folder: Folder): Promise<void>;
  findUniquePasswordsForFolder(folderId: string): Promise<string[]>;
  updateFolderForUsersWithPassword(folder: Folder, password: string): Promise<void>;
  markPasswordInvalidForUsers(folderId: string, password: string): Promise<void>;
}