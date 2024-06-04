import { Test, TestingModule } from '@nestjs/testing';
import { TreeCalcService } from './tree-calc.service';

describe('TreeCalcService', () => {
  let service: TreeCalcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TreeCalcService],
    }).compile();

    service = module.get<TreeCalcService>(TreeCalcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
