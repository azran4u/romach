import { RomachApiGraphqlClientService } from '../romach-api-graphql-client/romach-api-graphql-client.service';
import { RomachEntitiesApiInterface } from '../../../application/interfaces/romach-entities-api.interface';
import { FoldersByIdsResponse } from '../../../application/view-model/folders-by-ids-response';
import { RealityId } from '../../../application/entities/reality-id';
import { AppLoggerService } from '../../logging/app-logger.service';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { Hierarchy } from '../../../domain/entities/Hierarchy';
import { Result } from 'rich-domain';

export class RomachEntitiesApiService implements RomachEntitiesApiInterface {
  constructor(
    private romachApiGraphqlClientService: RomachApiGraphqlClientService,
    private reality: RealityId,
    private logger: AppLoggerService,
  ) {}
  foldersByIds(ids: string[]): Promise<FoldersByIdsResponse> {
    throw new Error('Method not implemented.');
  }
  getProtectedFoldersByIds(input: { id: string; password: string; }[]): Promise<Result<FoldersByIdsResponse, string, {}>> {
    throw new Error('Method not implemented.');
  }

  async basicFoldersByTimestamp(timestamp: string): Promise<BasicFolder[]> {
    return [];
  }
  async hierarchies(): Promise<Hierarchy[]> {
    this.logger.info(
      `[romach-api:${this.reality}] read hierarchies from romach api`,
    );
    const hierarchy1 = Hierarchy.create({
      id: '1',
      name: 'name1',
      displayName: 'displayName1',
      children: [],
    }).value();
    const hierarchy2 = Hierarchy.create({
      id: '2',
      name: 'name2',
      displayName: 'displayName2',
      children: [],
    }).value();
    const hierarchy3 = Hierarchy.create({
      id: '3',
      name: 'name3',
      displayName: 'displayName3',
      children: [],
    }).value();
    const mock: Hierarchy[] = [hierarchy1, hierarchy2, hierarchy3];
    return mock.filter((x) => Math.random() > 0.5);
  }
  

  async checkPassword(id: string, password: string): Promise<boolean> {
    return true;
  }
}
