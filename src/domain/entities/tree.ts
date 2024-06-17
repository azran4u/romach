import { BasicFolder } from './basic-folder';
import { BaseCategory } from './category';

export interface Tree {
  updatedAt: string;  
  nodes: TreeNode[];
}

export interface TreeNodeType<T> {
  type: 'folder' | 'category';
}

export interface BasicFolderTreeNode
  extends TreeNodeType<BasicFolder>,
    BasicFolder {
  type: 'folder';
}
export interface BaseCategoryTreeNode
  extends TreeNodeType<BaseCategory>,
    BaseCategory {
  type: 'category';
}

export type TreeNode = BasicFolderTreeNode | BaseCategoryTreeNode;
