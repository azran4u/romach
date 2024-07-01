import { Injectable } from '@nestjs/common';
import { RealityId } from '../../entities/reality-id';

export interface RegisterFoldersForUserInput {
  reality: RealityId;
  upn: string;
  folderIds: string[];
}

@Injectable()
export class RegisterFoldersForUserUseCase {
  async execute(dto: RegisterFoldersForUserInput): Promise<void> {
    // TODO
  }
}
