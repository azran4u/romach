import { BasicFolder } from './basic-folder';
import { Category } from './category';

export interface Tree {
  updatedAt: string;
  nodes: TreeNode[];
}

export interface TreeNodeType<T> {
  type: 'folder' | 'category';
}

export type TreeNodeBasicFolder = TreeNodeType<BasicFolder> & BasicFolder;
export type TreeNodeCategory = TreeNodeType<Category> & Category;

export type TreeNode = TreeNodeBasicFolder | TreeNodeCategory;
