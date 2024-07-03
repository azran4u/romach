import {
  exhaustMap,
  from,
  of,
  repeat,
  switchMap,
  takeWhile,
  tap,
  timer,
} from 'rxjs';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entities-api.interface';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { EventEmitterInterface } from '../../interfaces/event-handler-interface';
import { BasicFolder } from '../../../domain/entities/BasicFolder';
import { RxJsUtils } from '../../../utils/RxJsUtils/RxJsUtils';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { maxBy } from 'lodash';

export class BasicFoldersReplicationUseCase {
  private timestamp: Timestamp;

  constructor(
    private readonly romachApi: RomachEntitiesApiInterface,
    private readonly leaderElection: LeaderElectionInterface,
    private readonly eventEmitter: EventEmitterInterface,
    private interval: number,
  ) {
    this.timestamp = Timestamp.ts1970();
  }

  execute() {
    return this.leaderElection.isLeader().pipe(
      RxJsUtils.executeOnTrue(
        timer(0, this.interval).pipe(
          exhaustMap(() =>
            of(
              this.romachApi.getBasicFoldersByTimestamp(
                this.timestamp.toString(),
              ),
            ).pipe(
              exhaustMap((x) => x),
              tap((result) => {
                if (result.isOk()) {
                  const basicFolders = result.value();
                  if (basicFolders.length > 0) {
                    this.eventEmitter.emit({
                      type: 'BASIC_FOLDERS_UPDATED',
                      payload: basicFolders,
                    });
                    this.timestamp = Timestamp.fromString(
                      this.maxUpdatedAt(basicFolders).getProps().updatedAt,
                    );
                  }
                }
              }),
            ),
          ),
          takeWhile((result) => result.isOk() && result.value().length > 0),
        ),
      ),
    );
  }

  private maxUpdatedAt(basicFolders: BasicFolder[]) {
    return maxBy(basicFolders, (x) =>
      Timestamp.fromString(x.getProps().updatedAt).toNumber(),
    );
  }
}
