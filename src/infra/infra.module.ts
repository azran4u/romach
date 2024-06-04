import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { ChangeDetectionModule } from './change-detection/change-detection.module';
import { LoggingModule } from './logging/logging.module';
import { DatabaseModule } from './database/database.module';
import { HttpModule } from './http/http.module';
import { RepositoryModule } from './repository/repository.module';
import { RomachApiModule } from './romach-api/romach-api.module';
import { TaskQueueModule } from './task-queue/task-queue.module';
import { LeaderElectionModule } from './leader-election/leader-election.module';
import { RomachService } from './romach-api/romach/romach.service';
import { RepositoryService } from './repository/repository/repository.service';
import { LeaderElectionFactoryService } from './leader-election/leader-election/leader-election-factory.service';

@Module({
  imports: [
    AppConfigModule,
    LoggingModule,
    ChangeDetectionModule,
    DatabaseModule,
    HttpModule,
    RomachApiModule,
    RepositoryModule,
    TaskQueueModule,
    LeaderElectionModule,
  ],
  providers: [
    {
      provide: 'HierarchyLeaderElectionInterface',
      useFactory: (factory) =>
        factory.factory({ task: 'hierarchy-replication' }),
      inject: [LeaderElectionFactoryService],
    },
    {
      provide: 'RomachApiInterface',
      useClass: RomachService,
    },
    {
      provide: 'RomachRepositoryInterface',
      useClass: RepositoryService,
    },
  ],
  exports: [
    'HierarchyLeaderElectionInterface',
    'RomachApiInterface',
    'RomachRepositoryInterface',
  ],
})
export class InfraModule {}
