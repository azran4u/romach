import { BasicFolder } from '../../domain/entities/basic-folder';
import { Hierarchy } from '../../domain/entities/hierarchy';
import { LoginResponse } from '../entities/LoginResponse';
import { FoldersByIdsResponse } from '../entities/folders-by-ids-response';
import { RealityId } from '../entities/reality-id';

export interface RomachApiInterface {
  basicFoldersByTimestamp(
    realityId: RealityId,
    timestamp: string,
  ): Promise<BasicFolder[]>;
  hierarchies(realityId: RealityId): Promise<Hierarchy[]>;
  foldersByIds(
    realityId: RealityId,
    ids: string[],
  ): Promise<FoldersByIdsResponse>;
  checkPassword(id: string, password: string): Promise<boolean>;
  login(clientId: string, clientSecret: string): Promise<LoginResponse>;
}
