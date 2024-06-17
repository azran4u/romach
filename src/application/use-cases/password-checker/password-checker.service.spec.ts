import { Test, TestingModule } from '@nestjs/testing';
import { PasswordCheckerService } from './password-checker.service';

describe('PasswordCheckerService', () => {
  let service: PasswordCheckerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordCheckerService],
    }).compile();

    service = module.get<PasswordCheckerService>(PasswordCheckerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
