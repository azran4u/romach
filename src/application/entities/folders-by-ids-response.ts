import { Folder } from '../../domain/entities/folder';

export interface FoldersByIdsResponse {
  folders: Folder[];
  notFoundIds: string[];
  deletedIds: string[];
  wrongPasswordIds: string[];
  generalErrorIds: string[];
}
