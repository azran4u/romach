import { romachEntitiesApiInterfaceMockBuilder } from '../../mocks/romach-entities-interface.mock';
import { RomachRepositoryInterface } from '../../interfaces/romach-repository.interface';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { mockAppLoggerServiceBuilder } from '../../mocks/app-logger.mock';
import { eventEmitterMockBuilder } from '../../mocks/event-emitter-mock';
import { FlowUtils } from '../../../utils/FlowUtils/FlowUtils';
import { basicFoldersMock } from '../../mocks/entities.mock';
import { Result } from 'rich-domain';
import { RefetchFoldersService, RefetchFoldersServiceOptions } from './refetch-folders.use-case.service';

describe('RefetchFoldersService', () => {
  function createTest() {
    const mockApi = romachEntitiesApiInterfaceMockBuilder();
    const repositoryMock: RomachRepositoryInterface = {
      findUniquePasswordsForFolder: jest.fn().mockResolvedValue(['password1', 'password2']),
      updateFolderForAllUsers: jest.fn().mockResolvedValue(Result.Ok()),
      updateFolderForUsersWithPassword: jest.fn().mockResolvedValue(Result.Ok()),
      markPasswordInvalidForUsers: jest.fn().mockResolvedValue(Result.Ok()),
    } as unknown as RomachRepositoryInterface;

    const leaderElectionMock: LeaderElectionInterface = {
      isLeader: jest.fn().mockReturnValue(true),
    };

    const eventEmitterMock = eventEmitterMockBuilder();

    const loggerMock = mockAppLoggerServiceBuilder({
      print: true,
      debug: true,
    });

    const options: RefetchFoldersServiceOptions = {
      romachApi: mockApi,
      repository: repositoryMock,
      leaderElection: leaderElectionMock,
      logger: loggerMock,
      reality: 'realityId',
      interval: 100,
      chunkSize: 2,
      eventEmitter: eventEmitterMock,
    };

    const service = new RefetchFoldersService(options);

    return {
      service,
      mockApi,
      repositoryMock,
      leaderElectionMock,
      eventEmitterMock,
      loggerMock,
    };
  }

  it('should be defined', () => {
    const { service } = createTest();
    expect(service).toBeDefined();
  });

  it('should handle BASIC_FOLDERS_UPDATED event and execute the refetch', async () => {
    const { service, mockApi, repositoryMock, eventEmitterMock } = createTest();

    // Mock API responses
    mockApi.fetchFolderById = jest
      .fn()
      .mockResolvedValueOnce(Result.Ok(basicFoldersMock[0]))
      .mockResolvedValueOnce(Result.Ok(basicFoldersMock[1]));

    eventEmitterMock.emit({ type: 'BASIC_FOLDERS_UPDATED', payload: basicFoldersMock });

    await FlowUtils.delay(500); // Wait for the event handler to execute

    // Check if fetchFolderById was called for each folder in the mock payload
    expect(mockApi.fetchFolderById).toHaveBeenCalledTimes(basicFoldersMock.length);
    // Check if the repository was updated
    expect(repositoryMock.updateFolderForAllUsers).toHaveBeenCalledTimes(basicFoldersMock.length);
  });
});
