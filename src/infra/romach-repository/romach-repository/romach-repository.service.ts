import { RomachRepositoryInterface } from '../../../application/interfaces/romach-repository.interface';
import { FoldersByIdsResponse } from '../../../application/view-model/folders-by-ids-response';
import { RegisteredFolder } from '../../../domain/entities/RegisteredFolder';
import { RealityId } from '../../../application/entities/reality-id';
import { AppLoggerService } from '../../logging/app-logger.service';
import { Hierarchy } from '../../../domain/entities/Hierarchy';
import { Result } from 'rich-domain';
import { Knex } from 'knex';

export class RomachRepositoryService implements RomachRepositoryInterface {
  constructor(
    private readonly knex: Knex,
    private readonly logger: AppLoggerService,
    private reality: RealityId,
  ) {}
  upsertRegisteredFolders(
    folders: RegisteredFolder[],
  ): Promise<Result<void, string, {}>> {
    throw new Error('Method not implemented.');
  }
  getFoldersByIds(
    ids: string[],
  ): Promise<Result<FoldersByIdsResponse, string, {}>> {
    throw new Error('Method not implemented.');
  }

  async saveHierarchies(hierarchy: Hierarchy[]): Promise<void> {
    this.logger.info(
      `saved ${hierarchy?.length} hierarchies to database for reality ${this.reality}`,
    );
  }
  async getHierarchies(): Promise<Hierarchy[]> {
    this.logger.info(
      `read hierarchies from database for reality ${this.reality}`,
    );
    const mock = Hierarchy.create({
      id: '1',
      name: 'name1',
      displayName: 'displayName1',
      children: [],
    }).value();
    return [mock];
  }
  async saveFolderByIds(
    folderByIdsResponse: FoldersByIdsResponse,
  ): Promise<void> {
    this.logger.info(`saved folders to database for reality ${this.reality}`);
  }

  async getRegisteredFoldersByUpn(upn: string): Promise<Result<string[]>> {
    this.logger.info(`read registered folders for upn ${upn}`);
    return Result.Ok([]);
  }
}
