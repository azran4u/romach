import { Test, TestingModule } from '@nestjs/testing';
import { AddUserFolderService } from './add-user-folder.service';

describe('AddUserFolderService', () => {
  let service: AddUserFolderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddUserFolderService],
    }).compile();

    service = module.get<AddUserFolderService>(AddUserFolderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
