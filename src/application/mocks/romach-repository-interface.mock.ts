import { RomachRepositoryInterface } from '../interfaces/romach-repository.interface';

export function romachRepositoryInterfaceMockBuilder(): RomachRepositoryInterface  {
  return {
    saveHierarchies: jest.fn(),
    getHierarchies: jest.fn(),
    saveFolderByIds: jest.fn(),
    getFoldersByIds: jest.fn(),
    getRegisteredFoldersByUpn: jest.fn(),
    upsertRegisteredFolders: jest.fn(),
  };
};
