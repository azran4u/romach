import { romachRepositoryInterfaceMockBuilder } from '../../mocks/romach-repository-interface.mock';
import { romachEntitiesApiInterfaceMockBuilder } from '../../mocks/romach-entities-interface.mock';
import { leaderElectionInterfaceMockBuilder } from '../../mocks/leader-election-interface.mock';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entities-api.interface';
import { RomachRepositoryInterface } from '../../interfaces/romach-repository.interface';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { mockAppLoggerServiceBuilder } from '../../mocks/app-logger.mock';
import { timer, map } from 'rxjs';
import { RefetchFoldersService, RefetchFoldersServiceOptions } from './refetch-folders.use-case.service';
import { RealityId } from '../../entities/reality-id';

jest.setTimeout(5000);  // Set test timeout to 5 seconds

describe('RefetchFoldersService', () => {
  const folderIds = ['folder1', 'folder2'];
  const mockRealityId: RealityId = 'reality1' as RealityId;  // Mocking RealityId

  function mockRomachApiInterfaceBuilder(options?: {
    fetchFolderById?: () => Promise<any>;
    fetchFolderByIdWithPassword?: () => Promise<any>;
  }): RomachEntitiesApiInterface {
    return {
      ...romachEntitiesApiInterfaceMockBuilder(),
      fetchFolderById:
        options?.fetchFolderById ?? jest.fn().mockResolvedValue({ isOk: () => true, value: () => ({}) }),
      fetchFolderByIdWithPassword:
        options?.fetchFolderByIdWithPassword ?? jest.fn().mockResolvedValue({ isOk: () => true, value: () => ({}) }),
    };
  }

  function mockLeaderElectionInterfaceBuilder(
    input: boolean[] = [],
    interval: number = 1000,
  ): LeaderElectionInterface {
    return {
      ...leaderElectionInterfaceMockBuilder(),
      isLeader: jest
        .fn()
        .mockReturnValueOnce(timer(0, interval).pipe(map(() => input.shift() || true))),
    };
  }

  function mockRomachRepositoryInterfaceBuilder(
    options?: { isFolderProtected?: boolean[] }
  ): RomachRepositoryInterface {
    return {
      ...romachRepositoryInterfaceMockBuilder(),
      isFolderProtected: jest
        .fn()
        .mockImplementation((folderId) => {
          return Promise.resolve(options?.isFolderProtected?.shift() ?? false);
        }),
      findUniquePasswordsForFolder: jest.fn().mockResolvedValue(['password1', 'password2']),
      updateFolderForAllUsers: jest.fn().mockResolvedValue({}),
      updateFolderForUsersWithPassword: jest.fn().mockResolvedValue({}),
      markPasswordInvalidForUsers: jest.fn().mockResolvedValue({}),
    };
  }

  async function testingModuleBuilder(input?: Partial<RefetchFoldersServiceOptions>) {
    const options: RefetchFoldersServiceOptions = {
      romachApi: mockRomachApiInterfaceBuilder(),
      repository: mockRomachRepositoryInterfaceBuilder(),
      leaderElection: mockLeaderElectionInterfaceBuilder(),
      logger: mockAppLoggerServiceBuilder(),
      folderIds,
      reality: mockRealityId,
      interval: 10,
      chunkSize: 10,
      ...input,
    };

    return {
      service: new RefetchFoldersService(options),
      options,
    };
  }

  it('should be defined', async () => {
    const { service } = await testingModuleBuilder();
    expect(service).toBeDefined();
  });

  function scenarioTestBuilder(options: {
    reality: RealityId;
    leaderElectionValues: boolean[];
    fetchFolderById: jest.Mock;
    fetchFolderByIdWithPassword: jest.Mock;
    isFolderProtectedValues: boolean[];
    duration: number;
    leaderElectionPollInterval: number;
    fetchExpectedCalls: number;
    saveExpectedCalls: number;
  }) {
    return (done) => {
      const mockRomachApiInterface = mockRomachApiInterfaceBuilder({
        fetchFolderById: options.fetchFolderById,
        fetchFolderByIdWithPassword: options.fetchFolderByIdWithPassword,
      });
      const mockRomachRepositoryInterface = mockRomachRepositoryInterfaceBuilder({
        isFolderProtected: options.isFolderProtectedValues,
      });
      const mockLeaderElectionInterface = mockLeaderElectionInterfaceBuilder(
        options.leaderElectionValues,
        options.leaderElectionPollInterval,
      );

      testingModuleBuilder({
        romachApi: mockRomachApiInterface,
        repository: mockRomachRepositoryInterface,
        leaderElection: mockLeaderElectionInterface,
        reality: options.reality,
        folderIds,
        interval: 10,
      }).then(({ service }) => {
        const subscription = service.execute().subscribe();

        setTimeout(() => {
          subscription.unsubscribe();
          try {
            expect(mockRomachApiInterface.fetchFolderById).toHaveBeenCalledTimes(
              options.fetchExpectedCalls,
            );
            expect(mockRomachApiInterface.fetchFolderByIdWithPassword).toHaveBeenCalledTimes(
              options.saveExpectedCalls,
            );
            done();
          } catch (error) {
            done(error);
          }
        }, options.duration);
      });
    };
  }

  it(
    'should fetch folders when leader is true',
    scenarioTestBuilder({
      reality: mockRealityId,
      leaderElectionValues: [true],
      fetchFolderById: jest.fn().mockResolvedValue({}),
      fetchFolderByIdWithPassword: jest.fn().mockResolvedValue({}),
      isFolderProtectedValues: [true, false],
      duration: 1000,
      leaderElectionPollInterval: 10,
      fetchExpectedCalls: 1,
      saveExpectedCalls: 0,
    }),
  );

  it(
    'should stop fetching folders when leader changes to false',
    scenarioTestBuilder({
      reality: mockRealityId,
      leaderElectionValues: [true, false],
      fetchFolderById: jest.fn().mockResolvedValue({}),
      fetchFolderByIdWithPassword: jest.fn().mockResolvedValue({}),
      isFolderProtectedValues: [true, false],  // Mock values: first is protected, second is not
      duration: 1000,  // Test duration
      leaderElectionPollInterval: 500,  // Longer leader election interval for the change
      fetchExpectedCalls: 1,  // Expect one fetch before the leader change
      saveExpectedCalls: 0,  // No additional calls after leader change
    }),
  );

  it(
    'should handle fetching protected and unprotected folders separately',
    scenarioTestBuilder({
      reality: mockRealityId,
      leaderElectionValues: [true],  // Leader remains true
      fetchFolderById: jest.fn().mockResolvedValue({}),
      fetchFolderByIdWithPassword: jest.fn().mockResolvedValue({}),
      isFolderProtectedValues: [true, false],  // First folder is protected, second is not
      duration: 1000,  // Allow more time for the process
      leaderElectionPollInterval: 2000,  // Interval for leader election checks
      fetchExpectedCalls: 1,  // Fetch for unprotected folders
      saveExpectedCalls: 1,  // Fetch for protected folders
    }),
  );
});
