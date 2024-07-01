import { Injectable } from '@nestjs/common';
import { RealityId } from '../../entities/reality-id';

export interface AddProtectedFolderToUserInput {
  upn: string;
  password: string;
  reality: RealityId;
  folderId: string;
}
@Injectable()
export class AddProtectedFolderToUserUseCase {
  async execute(dto: AddProtectedFolderToUserInput): Promise<void> {
    // TODO
  }
}
