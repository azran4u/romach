import { FolderResolver } from './folder-resolver';
import { Module } from '@nestjs/common';

@Module({
  providers: [FolderResolver],
})
export class FolderGraphqlModule {}
