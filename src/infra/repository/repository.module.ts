import { Module } from '@nestjs/common';
import { RepositoryService } from './repository/repository.service';

@Module({
  providers: [RepositoryService]
})
export class RepositoryModule {}
