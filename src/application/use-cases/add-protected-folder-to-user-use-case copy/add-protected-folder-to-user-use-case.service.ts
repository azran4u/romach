import { RomachEntitiesApiInterface } from '../../interfaces/romach-entities-api.interface';
import { RegisteredFolderStatus } from '../../../domain/entities/RegisteredFolderStatus';
import { RomachRepositoryInterface } from '../../interfaces/romach-repository.interface';
import { RegisteredFolder } from '../../../domain/entities/RegisteredFolder';
import { Timestamp } from '../../../domain/entities/Timestamp';
import { Result } from 'rich-domain';

export interface AddProtectedFolderToUserUseCaseInput {
  upn: string;
  password: string;
  folderId: string;
}

export interface AddProtectedFolderToUserUseCaseOutput {}

export class AddProtectedFolderToUserUseCase {
  constructor(
    private repo: RomachRepositoryInterface,
    private api: RomachEntitiesApiInterface,
  ) {}
  async execute(
    input: AddProtectedFolderToUserUseCaseInput,
  ): Promise<Result<RegisteredFolderStatus, RegisteredFolderStatus>> {
    const { upn, password, folderId } = input;
    const result = await this.api.getProtectedFoldersByIds([
      { id: folderId, password },
    ]);
    if (result.isFail()) {
      return Result.fail('general-error');
    }
    const folderResult = result.value()[0];

    if (folderResult.status !== 'valid') {
      return Result.fail(folderResult.status);
    }

    const folder = folderResult.folder;

    if (!folder) {
      return Result.fail('general-error');
    }

    const registeredFolderCreationResult =
      RegisteredFolder.createValidRegisteredFolder({
        upn,
        folder,
        password,
        lastValidPasswordTimestamp: Timestamp.now(),
      });

    if (registeredFolderCreationResult.isFail()) {
      return Result.fail('general-error');
    }

    const upsertRegisteredFoldersResult =
      await this.repo.upsertRegisteredFolders([
        registeredFolderCreationResult.value(),
      ]);

    if (upsertRegisteredFoldersResult.isFail()) {
      return Result.fail('general-error');
    }

    return Result.Ok('valid');
  }
}
