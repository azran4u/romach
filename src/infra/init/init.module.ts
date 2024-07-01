import { LeaderElectionFactoryService } from '../leader-election/leader-election/postgres-based-leader-election-factory.service';
import { RomachApiJwtIssuerFactoryService } from '../romach-api/romach-api-jwt-issuer/romach-api-jwt-issuer-factory.service';
import { RomachApiJwtIssuerService } from '../romach-api/romach-api-jwt-issuer/romach-api-jwt-issuer.service';
import { LeaderElectionInterface } from '../../application/interfaces/leader-election.interface';
import { HierarchyReplicationFactoryService } from './hierarchy-replication-factory.service';
import { LeaderElectionModule } from '../leader-election/leader-election.module';
import { RomachRepositoryModule } from '../romach-repository/repository.module';
import { AppConfigService } from '../config/app-config/app-config.service';
import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RomachApiModule } from '../romach-api/romach-api.module';
import { AppLoggerService } from '../logging/app-logger.service';
import { Subscription, forkJoin } from 'rxjs';

@Module({
  imports: [LeaderElectionModule, RomachApiModule, RomachRepositoryModule],
  providers: [HierarchyReplicationFactoryService],
})
export class InitModule implements OnModuleInit, OnModuleDestroy {
  private romachApiJwtIssuerService: RomachApiJwtIssuerService;
  private hierarchyReplicationSubscription: Subscription;
  private replicationLeaderElection: LeaderElectionInterface;

  constructor(
    private leaderElectionFactoryService: LeaderElectionFactoryService,
    private romachApiJwtIssuerFactoryService: RomachApiJwtIssuerFactoryService,
    private hierarchyReplicationFactoryService: HierarchyReplicationFactoryService,
    private configService: AppConfigService,
    private logger: AppLoggerService,
  ) {
    this.romachApiJwtIssuerService =
      this.romachApiJwtIssuerFactoryService.create();
  }
  onModuleDestroy() {
    this.logger.info('Init module destroyed');
    this.romachApiJwtIssuerService.stop();
    this.hierarchyReplicationSubscription.unsubscribe();
    this.replicationLeaderElection.stop();
  }

  async onModuleInit() {
    this.logger.info('Init module started');
    await this.startJwtTokenHandler();
    this.startHierarchyReplication();
  }

  private async startJwtTokenHandler() {
    await this.romachApiJwtIssuerService.init();
  }

  private async startHierarchyReplication() {
    const realities = this.configService.get().romach.realities;

    this.replicationLeaderElection =
      await this.leaderElectionFactoryService.create({
        task: 'romach-replication-for-all-realities',
      });

    const replicationByRealityObservables = realities.map((reality) => {
      const hierarchyReplicationService =
        this.hierarchyReplicationFactoryService.create(
          reality,
          this.replicationLeaderElection,
        );
      return hierarchyReplicationService.execute();
    });

    this.hierarchyReplicationSubscription = forkJoin(
      replicationByRealityObservables,
    ).subscribe();
  }
}
