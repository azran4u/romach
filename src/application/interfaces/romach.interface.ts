import { BasicFolder } from '../../domain/entities/basic-folder';
import { Hierarchy } from '../../domain/entities/hierarchy';
import { FoldersByIdsResponse } from '../entities/folders-by-ids-response';
import { RealityId } from '../entities/reality-id';

export interface RomachApiInterface {
  getBasicFoldersBySequence(
    realityId: RealityId,
    sequence: number,
  ): Promise<BasicFolder[]>;
  getHierarchies(realityId: RealityId): Promise<Hierarchy[]>;
  getFoldersByIds(
    realityId: RealityId,
    ids: string[],
  ): Promise<FoldersByIdsResponse>;
}
