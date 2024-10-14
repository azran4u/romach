import { RomachEntitiesApiInterface } from '../interfaces/romach-entities-api.interface';

export function romachEntitiesApiInterfaceMockBuilder(): RomachEntitiesApiInterface {
  return {
    getBasicFoldersByTimestamp: jest.fn(),
    getHierarchies: jest.fn(),
    checkPassword: jest.fn(),
    getFoldersByIds: jest.fn(),
    fetchFolderById: jest.fn(),
    fetchFolderByIdWithPassword: jest.fn().mockResolvedValue({ isOk: () => true, value: () => ({}) }),
  };
};
