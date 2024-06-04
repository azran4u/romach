import { Module } from '@nestjs/common';
import { HierarchyReplicationService } from './services/hierarchy-replication/hierarchy-replication.service';
import { InfraModule } from '../infra/infra.module';

@Module({
  imports: [InfraModule],
  providers: [HierarchyReplicationService],
})
export class ApplicationModule {}
