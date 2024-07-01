import { RegisteredFolderStatus } from '../../domain/entities/RegisteredFolderStatus';
import { Folder } from '../../domain/entities/Folder';

export interface FoldersByIdsResponse {
  data: {
    id: string;
    status: RegisteredFolderStatus;
    content: Folder | null;
  }[];
}
