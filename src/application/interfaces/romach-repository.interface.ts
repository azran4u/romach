import { FoldersByIdResponse } from '../view-model/folders-by-ids-response';
import { RegisteredFolder } from '../../domain/entities/RegisteredFolder';
import { BasicFolder } from '../../domain/entities/BasicFolder';
import { Hierarchy } from '../../domain/entities/Hierarchy';
import { Result } from 'rich-domain';

export interface RomachRepositoryInterface {
  isFolderProtected(folderId: string): unknown;
  updateFolderForAllUsers(arg0: any): unknown;
  findUniquePasswordsForFolder(folderId: string): Promise<string[]>;
  updateFolderForUsersWithPassword(arg0: any, password: any): unknown;
  markPasswordInvalidForUsers(folderId: string, password: any): unknown;
  saveHierarchies(hierarchy: Hierarchy[]): Promise<void>;
  getHierarchies(): Promise<Hierarchy[]>;
  saveFolderByIds(folderByIdsResponse: FoldersByIdResponse): Promise<void>;
  getFoldersByIds(ids: string[]): Promise<Result<FoldersByIdResponse>>;
  getRegisteredFoldersByUpn(upn: string): Promise<Result<string[]>>;
  upsertRegisteredFolders(folders: RegisteredFolder[]): Promise<Result<void>>;
  saveBasicFolders(basicFolders: BasicFolder[]): Promise<Result<void>>;
}
