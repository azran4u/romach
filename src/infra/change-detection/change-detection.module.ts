import { Module } from '@nestjs/common';
import { HierarchyService } from './hierarchy/hierarchy.service';
import { BasicFolderService } from './basic-folder/basic-folder.service';
import { UserAllowedFoldersService } from './user-allowed-folders/user-allowed-folders.service';

@Module({
  providers: [HierarchyService, BasicFolderService, UserAllowedFoldersService]
})
export class ChangeDetectionModule {}
