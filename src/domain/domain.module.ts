import { Module } from '@nestjs/common';
import { TreeCalcService } from './services/tree-calc/tree-calc.service';

@Module({
  providers: [TreeCalcService],
})
export class DomainModule {}
