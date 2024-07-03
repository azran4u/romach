import { BasicFoldersReplicationUseCase } from './basic-folder-replication-use-case.service';
import { romachEntitiesApiInterfaceMock } from '../../mocks/romach-entities-interface.mock';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { EventEmitterInterface } from '../../interfaces/event-handler-interface';
import { FlowUtils } from '../../../utils/FlowUtils/FlowUtils';
import { basicFoldersMock } from '../../mocks/entities.mock';
import { BehaviorSubject } from 'rxjs';
import { Result } from 'rich-domain';
import { clone } from 'lodash';

describe('BasicFolderReplicationService', () => {
  const leaderElection = new BehaviorSubject<boolean>(true);
  function createTest() {
    const mockApi = clone(romachEntitiesApiInterfaceMock);

    const leaderElectionMock: LeaderElectionInterface = {
      isLeader: () => leaderElection.asObservable(),
    };
    const eventEmitterMock: EventEmitterInterface = {
      emit: jest.fn(),
      on: jest.fn(),
    };
    mockApi.getBasicFoldersByTimestamp = jest
      .fn()
      .mockResolvedValueOnce(Result.Ok([basicFoldersMock[0]]))
      .mockResolvedValueOnce(Result.Ok([basicFoldersMock[1]]))
      .mockResolvedValue(Result.Ok([]));

    const pollInterval = 100;

    const service = new BasicFoldersReplicationUseCase(
      mockApi,
      leaderElectionMock,
      eventEmitterMock,
      pollInterval,
    );

    return { service, mockApi, leaderElectionMock, eventEmitterMock };
  }
  it('should be defined', () => {
    const { service } = createTest();
    expect(service).toBeDefined();
  });

  it('valid input', async () => {
    const { service, mockApi, leaderElectionMock, eventEmitterMock } =
      createTest();

    const subscription = service.execute().subscribe();
    await FlowUtils.delay(300);
    leaderElection.next(false);
    subscription.unsubscribe();
    expect(mockApi.getBasicFoldersByTimestamp).toHaveBeenCalledTimes(3);
  });
});
