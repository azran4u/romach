import { Test, TestingModule } from '@nestjs/testing';
import { UserAllowedFoldersService } from './user-allowed-folders.service';

describe('UserAllowedFoldersService', () => {
  let service: UserAllowedFoldersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserAllowedFoldersService],
    }).compile();

    service = module.get<UserAllowedFoldersService>(UserAllowedFoldersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
