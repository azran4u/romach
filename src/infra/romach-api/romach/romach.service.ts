import { Injectable } from '@nestjs/common';
import { RomachApiInterface } from '../../../application/interfaces/romach.interface';
import { FoldersByIdsResponse } from '../../../application/entities/folders-by-ids-response';
import { BasicFolder } from '../../../domain/entities/basic-folder';
import { Hierarchy } from '../../../domain/entities/hierarchy';
import { AppLoggerService } from '../../logging/app-logger.service';

@Injectable()
export class RomachService implements RomachApiInterface {
  constructor(private logger: AppLoggerService) {}
  async basicFoldersByTimestamp(
    realityId: string,
    sequence: number,
  ): Promise<BasicFolder[]> {
    throw new Error('Method not implemented.');
  }
  async hierarchies(reality: string): Promise<Hierarchy[]> {
    this.logger.info(
      `[romach-api:${reality}] read hierarchies from romach api`,
    );
    const mock: Hierarchy[] = [
      {
        id: '1',
        name: 'name1',
        displayName: 'displayName1',
        children: [],
      },
      {
        id: '2',
        name: 'name2',
        displayName: 'displayName2',
        children: [],
      },
      {
        id: '3',
        name: 'name3',
        displayName: 'displayName3',
        children: [],
      },
    ];
    return mock.filter((x) => Math.random() > 0.5);
  }
  async foldersByIds(
    realityId: string,
    ids: string[],
  ): Promise<FoldersByIdsResponse> {
    throw new Error('Method not implemented.');
  }
}
