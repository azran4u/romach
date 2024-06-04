import { Test, TestingModule } from '@nestjs/testing';
import { BasicFolderService } from './basic-folder.service';

describe('BasicFolderService', () => {
  let service: BasicFolderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BasicFolderService],
    }).compile();

    service = module.get<BasicFolderService>(BasicFolderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
