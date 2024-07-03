import { RomachEntitiesApiInterface } from '../interfaces/romach-entities-api.interface';

export const romachEntitiesApiInterfaceMock: RomachEntitiesApiInterface = {
  getBasicFoldersByTimestamp: jest.fn(),
  getHierarchies: jest.fn(),
  checkPassword: jest.fn(),
  getFoldersByIds: jest.fn(),
};
