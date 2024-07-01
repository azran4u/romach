import { Test, TestingModule } from '@nestjs/testing';
import { RegisterFoldersForUserUseCase } from './register-folders-for-user.use-case.service';

describe('AddUserFolderService', () => {
  let service: RegisterFoldersForUserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegisterFoldersForUserUseCase],
    }).compile();

    service = module.get<RegisterFoldersForUserUseCase>(
      RegisterFoldersForUserUseCase,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
