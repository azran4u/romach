import { romachEntitiesApiInterfaceMockBuilder } from '../../mocks/romach-entities-interface.mock';
import { BasicFoldersReplicationUseCase } from './basic-folder-replication-use-case.service';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { mockAppLoggerServiceBuilder } from '../../mocks/app-logger.mock';
import { eventEmitterMockBuilder } from '../../mocks/event-emitter-mock';
import { FlowUtils } from '../../../utils/FlowUtils/FlowUtils';
import { basicFoldersMock } from '../../mocks/entities.mock';
import { BehaviorSubject } from 'rxjs';
import { Result } from 'rich-domain';

describe('BasicFolderReplicationService', () => {
  const leaderElection = new BehaviorSubject<boolean>(true);
  function createTest() {
    const mockApi = romachEntitiesApiInterfaceMockBuilder();

    const leaderElectionMock: LeaderElectionInterface = {
      isLeader: () => leaderElection.asObservable(),
    };
    const eventEmitterMock = eventEmitterMockBuilder();

    const loggerMock = mockAppLoggerServiceBuilder({
      print: true,
      debug: true,
    });
    mockApi.getBasicFoldersByTimestamp = jest
      .fn()
      .mockResolvedValueOnce(Result.Ok([basicFoldersMock[0]]))
      .mockResolvedValueOnce(
        Result.Ok([basicFoldersMock[0], basicFoldersMock[1]]),
      )
      .mockRejectedValueOnce(new Error('error'))
      .mockResolvedValue(Result.Ok([]));

    const pollInterval = 100;

    const service = new BasicFoldersReplicationUseCase(
      mockApi,
      leaderElectionMock,
      eventEmitterMock,
      pollInterval,
      loggerMock,
    );

    return {
      service,
      mockApi,
      leaderElectionMock,
      eventEmitterMock,
      loggerMock,
    };
  }
  it('should be defined', () => {
    const { service } = createTest();
    expect(service).toBeDefined();
  });

  it('valid input', async () => {
    const { service, mockApi, leaderElectionMock, eventEmitterMock } =
      createTest();

    const subscription = service.execute().subscribe();
    await FlowUtils.delay(500);
    leaderElection.next(false);
    subscription.unsubscribe();
    expect(mockApi.getBasicFoldersByTimestamp).toHaveBeenCalledTimes(7);
    expect(eventEmitterMock.emit).toHaveBeenCalledTimes(2);
  });
});
