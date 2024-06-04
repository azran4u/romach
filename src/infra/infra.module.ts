import { Module, OnModuleInit } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { ChangeDetectionModule } from './change-detection/change-detection.module';
import { LoggingModule } from './logging/logging.module';
import { DatabaseModule } from './database/database.module';
import { HttpModule } from './http/http.module';
import { RepositoryModule } from './repository/repository.module';
import { RomachApiModule } from './romach-api/romach-api.module';
import { TaskQueueModule } from './task-queue/task-queue.module';
import { TestService } from './test/test.service';
import { LeaderElectionModule } from './leader-election/leader-election.module';
import { Test2Service } from './test2/test2.service';
import { HierarchyLeaderElectionService } from './leader-election/hierarchy-leader-election/hierarchy-leader-election.service';
import { RomachService } from './romach-api/romach/romach.service';
import { RepositoryService } from './repository/repository/repository.service';
import { LeaderElectionBaseService } from './leader-election/leader-election-base/leader-election-base.service';

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
    TestService,
    Test2Service,
    {
      provide: 'HierarchyLeaderElectionInterface',
      useClass: HierarchyLeaderElectionService,
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
    TestService,
    Test2Service,
    'HierarchyLeaderElectionInterface',
    'RomachApiInterface',
    'RomachRepositoryInterface',
  ],
})
export class InfraModule {}
