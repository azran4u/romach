import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RomachRepositoryInterface } from '../../../application/interfaces/repository.interface';
import { FoldersByIdsResponse } from '../../../application/entities/folders-by-ids-response';
import { Hierarchy } from '../../../domain/entities/hierarchy';
import { AppLoggerService } from '../../logging/app-logger.service';
import { Knex } from 'knex';
import { InjectKnex } from 'nestjs-knex';
import { AppConfigService } from '../../config/app-config/app-config.service';

@Injectable()
export class RepositoryService implements RomachRepositoryInterface {
  constructor(
    @InjectKnex() public readonly knex: Knex,
    private readonly logger: AppLoggerService,
    private configService: AppConfigService,
  ) {}

  async saveHierarchies(
    reality: string,
    hierarchy: Hierarchy[],
  ): Promise<void> {
    if (Math.random() > 0.5) {
      throw new InternalServerErrorException('database save error');
    }
    this.logger.info(`saved ${hierarchy?.length} hierarchies to database`);
    return;
  }
  async getHierarchies(reality: string): Promise<Hierarchy[]> {
    this.logger.info(`read hierarchies from database`);
    const mock: Hierarchy = {
      id: '1',
      name: 'name1',
      displayName: 'displayName1',
      children: [],
    };
    return [mock];
  }
  async saveFolderByIds(
    folderByIdsResponse: FoldersByIdsResponse,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getFoldersByIds(): Promise<FoldersByIdsResponse> {
    throw new Error('Method not implemented.');
  }
}
