import { Test, TestingModule } from '@nestjs/testing';
import { AddProtectedFolderToUserUseCase } from './add-protected-folder-to-user.use-case.service';

describe('PasswordCheckerService', () => {
  let service: AddProtectedFolderToUserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddProtectedFolderToUserUseCase],
    }).compile();

    service = module.get<AddProtectedFolderToUserUseCase>(
      AddProtectedFolderToUserUseCase,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
