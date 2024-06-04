import { Hierarchy } from '../../domain/entities/hierarchy';
import { FoldersByIdsResponse } from '../entities/folders-by-ids-response';

export interface RomachRepositoryInterface {
  saveHierarchies(reality: string, hierarchy: Hierarchy[]): Promise<void>;
  getHierarchies(reality: string): Promise<Hierarchy[]>;
  saveFolderByIds(folderByIdsResponse: FoldersByIdsResponse): Promise<void>;
  getFoldersByIds(): Promise<FoldersByIdsResponse>;
}
