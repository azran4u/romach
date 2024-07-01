import { Test, TestingModule } from '@nestjs/testing';
import { RefetchFoldersService } from './refetch-folders.use-case.service';

describe('FoldersUpdaterService', () => {
  let service: RefetchFoldersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefetchFoldersService],
    }).compile();

    service = module.get<RefetchFoldersService>(RefetchFoldersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
