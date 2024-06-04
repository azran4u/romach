import { Module } from '@nestjs/common';
import { RomachApiGraphqlClientService } from './romach-api-graphql-client/romach-api-graphql-client.service';
import { RomachApiJwtIssuerService } from './romach-api-jwt-issuer/romach-api-jwt-issuer.service';
import { FolderByIdService } from './folder-by-id/folder-by-id.service';
import { FolderPasswordCheckerService } from './folder-password-checker/folder-password-checker.service';
import { RomachApiRestClientService } from './romach-api-rest-client/romach-api-rest-client.service';
import { RomachService } from './romach/romach.service';

@Module({
  providers: [RomachApiGraphqlClientService, RomachApiJwtIssuerService, FolderByIdService, FolderPasswordCheckerService, RomachApiRestClientService, RomachService]
})
export class RomachApiModule {}
