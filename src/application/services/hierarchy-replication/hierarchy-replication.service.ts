import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { RomachApiInterface } from '../../interfaces/romach.interface';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { RomachRepositoryInterface } from '../../interfaces/repository.interface';
import {
  catchError,
  concatMap,
  filter,
  map,
  mergeMap,
  retry,
  switchMap,
  tap,
} from 'rxjs/operators';
import { EMPTY, Observable, OperatorFunction, from, timer } from 'rxjs';
import { isEqual } from 'lodash';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { RxJsUtils } from '../../../utils/RxJsUtils/RxJsUtils';
import { Hierarchy } from '../../../domain/entities/hierarchy';
import { AppConfigService } from '../../../infra/config/app-config/app-config.service';
import { Configuration } from '../../../infra/config/configuration';
import { TOKENS } from '../../../constants';

@Injectable()
export class HierarchyReplicationService implements OnModuleInit {
  private config: Configuration;
  private realities: string[];
  private interval: number;

  constructor(
    @Inject(TOKENS.RomachApiInterface)
    private romachApiInterface: RomachApiInterface,

    @Inject(TOKENS.HierarchyLeaderElectionInterface)
    private hierarchyLeaderElection: LeaderElectionInterface,

    @Inject(TOKENS.RomachRepositoryInterface)
    private romachRepositoryInterface: RomachRepositoryInterface,

    private readonly logger: AppLoggerService,
    private readonly configService: AppConfigService,
  ) {
    this.config = this.configService.get();
    this.realities = this.config.romach.realities;
    this.interval = this.config.romach.hierarchy.pollInterval;
  }

  onModuleInit() {
    this.logger.info('HierarchyReplicationService has been initialized.');
    this.hierarchyLeaderElection.start();
    this.run().subscribe();
  }

  run() {
    return this.hierarchyLeaderElection.isLeader().pipe(
      tap((isLeader) =>
        this.logger.info(
          `hierarchyLeaderElection leader has changed. current status: ${isLeader}`,
        ),
      ),
      RxJsUtils.executeOnTrue(this.replication()),
    );
  }

  private replication() {
    return from(this.realities).pipe(
      tap((reality) =>
        this.logger.info(
          `Starting hierarchy replication for reality ${reality}`,
        ),
      ),
      mergeMap((reality) => this.poller(this.interval, reality)),
    );
  }

  public poller(interval: number, reality: string): Observable<unknown> {
    return timer(0, interval).pipe(this.perRealityReplicator(reality));
  }

  private perRealityReplicator(
    reality: string,
  ): OperatorFunction<unknown, unknown> {
    return (source: Observable<unknown>) =>
      source.pipe(
        tap(() =>
          this.logger.debug(`Handling hierarchy for reality ${reality}`),
        ),
        this.fetcher(reality),
        this.readCurrentHierarchies(reality),
        this.differ(reality),
        this.saver(reality),
      );
  }

  private fetcher(reality: string): OperatorFunction<unknown, Hierarchy[]> {
    return (source: Observable<unknown>) => {
      return source.pipe(
        concatMap((_) =>
          from(this.romachApiInterface.getHierarchies(reality)).pipe(
            tap((hierarchies) =>
              this.logger.info(
                `fetched hierarchies for reality ${reality} count: ${hierarchies.length}`,
              ),
            ),
            retry(2),
            catchError((error) => {
              this.logger.error(
                `Error while fetching hierarchy from romach api for reality ${reality}`,
                error,
              );
              return EMPTY;
            }),
          ),
        ),
      );
    };
  }

  private readCurrentHierarchies(
    reality: string,
  ): OperatorFunction<Hierarchy[], { curr: Hierarchy[]; next: Hierarchy[] }> {
    return (source: Observable<Hierarchy[]>) =>
      source.pipe(
        switchMap((newHierarchy) =>
          from(this.romachRepositoryInterface.getHierarchies(reality)).pipe(
            tap((currentHierarchy) =>
              this.logger.info(
                `read hierarchies from repository for reality ${reality} count: ${currentHierarchy.length}`,
              ),
            ),
            retry(2),
            map((currentHierarchy) => ({
              curr: currentHierarchy,
              next: newHierarchy,
            })),
            catchError((error) => {
              this.logger.error(
                `Error while fetching hierarchy from romach repository for reality ${reality}`,
                error,
              );
              return EMPTY;
            }),
          ),
        ),
      );
  }

  private differ(
    reality: string,
  ): OperatorFunction<{ curr: Hierarchy[]; next: Hierarchy[] }, Hierarchy[]> {
    return (source: Observable<{ curr: Hierarchy[]; next: Hierarchy[] }>) => {
      return source.pipe(
        tap(({ curr, next }) => {
          this.logger.debug(
            `Differ Got hierarchies for reality ${reality} current count: ${curr.length} next count: ${next.length}`,
          );
        }),
        filter(({ curr, next }) => !this.equal(curr, next)),
        tap(({ curr, next }) =>
          this.logger.info(
            `Hierarchy changed for reality ${reality} old: ${curr.length} new ${next.length}`,
          ),
        ),
        map(({ curr, next }) => next),
      );
    };
  }

  private equal(a: Hierarchy[], b: Hierarchy[]) {
    return isEqual(a, b);
  }

  private saver(reality: string): OperatorFunction<Hierarchy[], void> {
    return (source: Observable<Hierarchy[]>) => {
      return source.pipe(
        switchMap((newHierarchy) =>
          from(
            this.romachRepositoryInterface.saveHierarchies(
              reality,
              newHierarchy,
            ),
          ).pipe(
            tap(() => {
              this.logger.info(
                `Hierarchy saved for reality ${reality} count: ${newHierarchy.length}`,
              );
            }),
            retry(2),
            catchError((error) => {
              this.logger.error(
                `Error while saving hierarchy to database for reality ${reality}`,
                error,
              );
              return EMPTY;
            }),
          ),
        ),
      );
    };
  }
}
