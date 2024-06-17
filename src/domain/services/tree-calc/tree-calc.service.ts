import { Injectable } from '@nestjs/common';
import { BasicFolder } from '../../entities/basic-folder';
import { Hierarchy } from '../../entities/hierarchy';
import { Tree } from '../../entities/tree';

@Injectable()
export class TreeCalcService {
  calculateTree(basicFolders: BasicFolder[], hierarchies: Hierarchy[]): Tree {
    return {
      updatedAt: new Date().toISOString(),
      nodes: [],
    };
  }
}
