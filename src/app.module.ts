import { Module } from '@nestjs/common';
import { DomainModule } from './domain/domain.module';
import { InfraModule } from './infra/infra.module';
import { ApplicationModule } from './application/application.module';

@Module({
  imports: [DomainModule, ApplicationModule, InfraModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
