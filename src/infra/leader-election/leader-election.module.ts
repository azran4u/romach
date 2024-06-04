import { Module } from '@nestjs/common';
import { LeaderElectionFactoryService } from './leader-election/leader-election-factory.service';

@Module({
  providers: [LeaderElectionFactoryService],
  exports: [LeaderElectionFactoryService],
})
export class LeaderElectionModule {}
