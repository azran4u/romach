import { Test } from '@nestjs/testing';
import { HierarchyReplicationService } from './hierarchy-replication.service';
import { RomachApiInterface } from '../../interfaces/romach.interface';
import { LeaderElectionInterface } from '../../interfaces/leader-election.interface';
import { map, timer } from 'rxjs';
import { RomachRepositoryInterface } from '../../interfaces/repository.interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { AppConfigService } from '../../../infra/config/app-config/app-config.service';
import { Configuration } from '../../../infra/config/configuration';
import { Hierarchy } from '../../../domain/entities/hierarchy';

describe('HierarchyReplicationService', () => {
  const mockHierarchies: Hierarchy[] = [
    {
      id: '1',
      name: 'name1',
      displayName: 'displayName1',
      children: [],
    },
    {
      id: '2',
      name: 'name2',
      displayName: 'displayName2',
      children: [],
    },
  ];

  function mockRomachApiInterfaceBuilder(options?: {
    getHierarchies?: (realityId: string) => Promise<Hierarchy[]>;
  }): RomachApiInterface {
    return {
      getHierarchies:
        options?.getHierarchies ??
        jest
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([mockHierarchies[0]])
          .mockResolvedValue([mockHierarchies[1]]),
      getBasicFoldersBySequence: jest.fn().mockReturnValue([]),
      getFoldersByIds: jest.fn().mockReturnValue([]),
    };
  }

  function mockLeaderElectionInterfaceBuilder(
    input: boolean[] = [],
    interval: number = 1000,
  ): LeaderElectionInterface {
    return {
      start: jest.fn(),
      stop: jest.fn(),
      isLeader: jest
        .fn()
        .mockReturnValueOnce(timer(0, interval).pipe(map(() => input.shift()))),
    };
  }

  function mockRomachRepositoryInterfaceBuilder(
    initialHierarchies: Hierarchy[] = [],
  ): RomachRepositoryInterface {
    let hierarchies: Hierarchy[] = initialHierarchies;
    const saveHierarchies = jest
      .fn()
      .mockImplementation((reality, hierarchy) => {
        hierarchies = hierarchy;
        return Promise.resolve();
      });

    const getHierarchies = jest.fn().mockImplementation((reality) => {
      return Promise.resolve(hierarchies);
    });
    return {
      saveHierarchies,
      getHierarchies,
      getFoldersByIds: jest.fn(),
      saveFolderByIds: jest.fn(),
    };
  }

  function mockAppConfigServiceBuilder(
    realities: string[] = [],
    pollInterval: number = 1000,
  ): AppConfigService {
    const mockConfig: Partial<Configuration> = {
      //@ts-ignore
      romach: {
        realities,
        hierarchy: {
          pollInterval,
        },
      },
    };
    return {
      // @ts-ignore
      get: () => mockConfig,
    };
  }

  function mockAppLoggerServiceBuilder(enableDebug = false): AppLoggerService {
    // @ts-ignore
    return {
      info: (message, meta) => {
        const timestamp = new Date().toISOString();
        console.log(
          `${timestamp} ${message} ${meta ? JSON.stringify(meta) : ''}`,
        );
      },
      error: console.error,
      debug: enableDebug ? console.debug : jest.fn(),
    };
  }

  async function testingModuleBuilder(options?: {
    romachApiInterface?: RomachApiInterface;
    hierarchyLeaderElectionInterface?: LeaderElectionInterface;
    romachRepositoryInterface?: RomachRepositoryInterface;
    logger?: AppLoggerService;
    config?: AppConfigService;
  }) {
    const module = await Test.createTestingModule({
      providers: [
        HierarchyReplicationService,
        {
          provide: 'RomachApiInterface',
          useValue:
            options?.romachApiInterface ?? mockRomachApiInterfaceBuilder(),
        },
        {
          provide: 'HierarchyLeaderElectionInterface',
          useValue:
            options?.hierarchyLeaderElectionInterface ??
            mockLeaderElectionInterfaceBuilder(),
        },
        {
          provide: 'RomachRepositoryInterface',
          useValue:
            options?.romachRepositoryInterface ??
            mockRomachRepositoryInterfaceBuilder(),
        },
        {
          provide: AppLoggerService,
          useValue: options?.logger ?? mockAppLoggerServiceBuilder(),
        },
        {
          provide: AppConfigService,
          useValue: options?.config ?? mockAppConfigServiceBuilder(),
        },
      ],
    }).compile();

    const service = module.get(HierarchyReplicationService);
    return { module, service };
  }

  it('should be defined', async () => {
    const { module, service } = await testingModuleBuilder();
    expect(service).toBeDefined();
  });

  interface ScenarioTestBuilderOptions {
    realities: string[];
    leaderElectionValues: boolean[];
    getHierarchiesMock: jest.Mock;
    duration: number;
    repositoryInitialHierarchies?: Hierarchy[];
    leaderElectionPollInterval: number;
    getHierarchiesPollInterval: number;
    getHierarchiesExpectedCalls: number;
    saveHierarchiesExpectedCalls: number;
  }

  function scenarioTestBuilder(options: ScenarioTestBuilderOptions) {
    const {
      realities,
      leaderElectionValues,
      getHierarchiesMock,
      duration,
      repositoryInitialHierarchies,
      leaderElectionPollInterval,
      getHierarchiesPollInterval,
      getHierarchiesExpectedCalls,
      saveHierarchiesExpectedCalls,
    } = options;
    return (done) => {
      const mockRomachApiInterface = mockRomachApiInterfaceBuilder({
        getHierarchies: getHierarchiesMock,
      });
      const mockRomachRepositoryInterface =
        mockRomachRepositoryInterfaceBuilder(repositoryInitialHierarchies);
      const mockHierarchyLeaderElectionInterface =
        mockLeaderElectionInterfaceBuilder(
          leaderElectionValues,
          leaderElectionPollInterval,
        );

      testingModuleBuilder({
        romachApiInterface: mockRomachApiInterface,
        hierarchyLeaderElectionInterface: mockHierarchyLeaderElectionInterface,
        romachRepositoryInterface: mockRomachRepositoryInterface,
        logger: mockAppLoggerServiceBuilder(),
        config: mockAppConfigServiceBuilder(
          realities,
          getHierarchiesPollInterval,
        ),
      }).then(({ module, service }) => {
        const fn = jest.fn();
        const subscription = service.run().subscribe(fn);

        setTimeout(() => {
          subscription.unsubscribe();
          try {
            expect(mockRomachApiInterface.getHierarchies).toHaveBeenCalledTimes(
              getHierarchiesExpectedCalls,
            );
            expect(
              mockRomachRepositoryInterface.saveHierarchies,
            ).toHaveBeenCalledTimes(saveHierarchiesExpectedCalls);
            done();
          } catch (error) {
            done(error);
          }
        }, duration);
      });
    };
  }

  it(
    'when leader is true, should call getHierarchies',
    scenarioTestBuilder({
      realities: ['reality1'],
      leaderElectionValues: [true],
      getHierarchiesMock: jest.fn().mockResolvedValue([]),
      duration: 1000,
      leaderElectionPollInterval: 2000,
      getHierarchiesPollInterval: 100,
      getHierarchiesExpectedCalls: 10,
      saveHierarchiesExpectedCalls: 0,
    }),
  );
  it(
    'when leader is changed to false, should not call getHierarchies',
    scenarioTestBuilder({
      realities: ['reality1'],
      leaderElectionValues: [true, false],
      getHierarchiesMock: jest.fn().mockResolvedValue([]),
      duration: 1000,
      leaderElectionPollInterval: 500,
      getHierarchiesPollInterval: 100,
      getHierarchiesExpectedCalls: 5,
      saveHierarchiesExpectedCalls: 0,
    }),
  );

  it(
    'when hierarchies changed 2 times, should call saveHierarchies 2 times',
    scenarioTestBuilder({
      realities: ['reality1'],
      leaderElectionValues: [true],
      repositoryInitialHierarchies: [],
      getHierarchiesMock: jest
        .fn()
        .mockResolvedValueOnce([]) // same a initial
        .mockResolvedValueOnce([mockHierarchies[0]])
        .mockResolvedValue([]),
      duration: 1000,
      leaderElectionPollInterval: 4000,
      getHierarchiesPollInterval: 300,
      getHierarchiesExpectedCalls: 4,
      saveHierarchiesExpectedCalls: 2,
    }),
  );
});
