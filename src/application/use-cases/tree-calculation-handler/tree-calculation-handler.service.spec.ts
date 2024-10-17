import { Test, TestingModule } from '@nestjs/testing';
import { RomachRepositoryInterface } from '../../interfaces/romach-repository.interface';
import { RomachEntitiesApiInterface } from '../../interfaces/romach-entities-api.interface';
import { AppLoggerService } from '../../../infra/logging/app-logger.service';
import { BasicFolder } from 'src/domain/entities/BasicFolder';
import { Result } from 'rich-domain';
import { BasicFolderReplicationService } from '../folders-change-handler/folders-change-handler.service';

const ROMACH_ENTITIES_API = 'RomachEntitiesApiInterface';
const ROMACH_REPOSITORY = 'RomachRepositoryInterface';
const APP_LOGGER = 'AppLoggerService';

describe('BasicFolderReplicationService', () => {
  let service: BasicFolderReplicationService;
  let mockRomachApi: RomachEntitiesApiInterface;
  let mockRepository: RomachRepositoryInterface;
  let mockLogger: AppLoggerService;

  beforeEach(async () => {
    mockRomachApi = {
      getBasicFoldersByTimestamp: jest.fn(),
    } as unknown as RomachEntitiesApiInterface;

    mockRepository = {
      getFoldersByIds: jest.fn(),
      saveFolderByIds: jest.fn(),
    } as unknown as RomachRepositoryInterface;

    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    } as unknown as AppLoggerService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BasicFolderReplicationService,
        {
          provide: ROMACH_ENTITIES_API,
          useValue: mockRomachApi,
        },
        {
          provide: ROMACH_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: APP_LOGGER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<BasicFolderReplicationService>(BasicFolderReplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch basic folders and log the process', async () => {
    const mockFolders: BasicFolder[] = [
      BasicFolder.create({
        id: '1',
        name: 'Folder 1',
        deleted: false,
        isLocal: false,
        isPasswordProtected: false,
        creationDate: '2023-01-01',
        updatedAt: '2023-01-02',
        categoryId: 'cat1',
      }).value(),
    ];

    (mockRomachApi.getBasicFoldersByTimestamp as jest.Mock).mockResolvedValue(Result.Ok(mockFolders));

    await service['fetchBasicFolders']();

    expect(mockRomachApi.getBasicFoldersByTimestamp).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith('Fetched 1 basic folders');
  });

  it('should compare fetched folders with existing ones and return changed folders', async () => {
    const mockFetchedFolders: BasicFolder[] = [
      BasicFolder.create({
        id: '1',
        name: 'Folder 1',
        deleted: false,
        isLocal: false,
        isPasswordProtected: false,
        creationDate: '2023-01-01',
        updatedAt: '2023-01-02',
        categoryId: 'cat1',
      }).value(),
    ];

    const mockExistingFolders = {
      id: '1',
      status: 'valid',
      content: BasicFolder.create({
        id: '1',
        name: 'Folder 1',
        deleted: false,
        isLocal: false,
        isPasswordProtected: false,
        creationDate: '2023-01-01',
        updatedAt: '2023-01-01',
        categoryId: 'cat1',
      }).value(),
    };

    (mockRepository.getFoldersByIds as jest.Mock).mockResolvedValue(Result.Ok(mockExistingFolders));

    const changedFolders = await service['compareWithExistingFolders'](mockFetchedFolders);

    expect(changedFolders.length).toBe(1);
    expect(mockLogger.debug).toHaveBeenCalledWith('Comparing fetched folders with existing folders in the repository...');
  });

  it('should save changed folders to the repository', async () => {
    const mockChangedFolders: BasicFolder[] = [
      BasicFolder.create({
        id: '1',
        name: 'Folder 1',
        deleted: false,
        isLocal: false,
        isPasswordProtected: false,
        creationDate: '2023-01-01',
        updatedAt: '2023-01-02',
        categoryId: 'cat1',
      }).value(),
    ];

    await service['saveChangedFolders'](mockChangedFolders);

    expect(mockRepository.saveFolderByIds).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith('Changed folders saved to the repository successfully.');
  });

  it('should recalculate the folder tree', async () => {
    await service['recalculateTree']();

    expect(mockLogger.debug).toHaveBeenCalledWith('Recalculating folder tree...');
    expect(mockLogger.info).toHaveBeenCalledWith('Folder tree recalculated successfully.');
  });
});
