import { BasicFolder } from './basic-folder.js';

export interface Folder extends BasicFolder {
  entities: {
    areas: string[];
    points: string[];
  }
}
