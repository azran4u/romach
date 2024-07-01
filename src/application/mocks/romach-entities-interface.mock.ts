import { RomachEntitiesApiInterface } from '../interfaces/romach-entities-api.interface';

export const romachEntitiesApiInterfaceMock: RomachEntitiesApiInterface = {
  basicFoldersByTimestamp: jest.fn(),
  hierarchies: jest.fn(),
  foldersByIds: jest.fn(),
  checkPassword: jest.fn(),
  getProtectedFoldersByIds: jest.fn(),
};
