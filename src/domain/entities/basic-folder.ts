export interface BasicFolderProps {
  id: string;
  name: string;
  deleted: boolean;
  isLocal: boolean;
  isViewProtected: boolean;
  creationDate: string;
  updatedAt: string;
  categoryId: string;
}
export class BasicFolder {
  private props: BasicFolderProps;
  private constructor(props: BasicFolderProps) {
    this.props = props;
  }
  static create(props: BasicFolderProps): BasicFolder {
    return new BasicFolder(props);
  }
  validate(): boolean {
    return true;
  }
}
