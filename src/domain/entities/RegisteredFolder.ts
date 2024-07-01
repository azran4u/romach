import { ISpecification } from '../../utils/SpecificationUtils.ts/SpecificationUtils.js';
import { RegisteredFolderStatus } from './RegisteredFolderStatus.js';
import { Timestamp } from './Timestamp.js';
import { Folder } from './Folder.js';
import { Result } from 'rich-domain';
import { UPN } from './UPN.js';
import { isNil } from 'lodash';

export interface RegisteredFolderProps {
  upn: UPN;
  folderId: string;
  password?: string;
  isPasswordProtected: boolean;
  status: RegisteredFolderStatus;
  folder: Folder | null;
  lastValidPasswordTimestamp: Timestamp | null;
  registeredTimestamp: Timestamp;
  updatedAtTimestamp: Timestamp;
}

export type PasswordProtectedValidSpecificationProps = Pick<
  RegisteredFolderProps,
  'isPasswordProtected' | 'password' | 'lastValidPasswordTimestamp'
>;

class PasswordProtectedValidSpecification
  implements ISpecification<PasswordProtectedValidSpecificationProps>
{
  isSatisfiedBy(
    candidate: PasswordProtectedValidSpecificationProps,
  ): Result<boolean, string> {
    if (
      candidate.isPasswordProtected &&
      (isNil(candidate.lastValidPasswordTimestamp) || isNil(candidate.password))
    )
      return Result.fail(
        'folder is password protected but no password nor timestamp provided',
      );

    return Result.Ok(true);
  }
}

export class RegisteredFolder {
  private constructor(private readonly props: RegisteredFolderProps) {}

  static createValidRegisteredFolder(
    input: Pick<
      RegisteredFolderProps,
      'upn' | 'folder' | 'password' | 'lastValidPasswordTimestamp'
    >,
  ): Result<RegisteredFolder, string> {
    const basicFolderProps = input.folder.getProps().basicFolder.getProps();
    const passwordProtectedValidSpecification =
      new PasswordProtectedValidSpecification().isSatisfiedBy({
        isPasswordProtected: basicFolderProps.isPasswordProtected,
        password: input.password,
        lastValidPasswordTimestamp: input.lastValidPasswordTimestamp,
      });

    if (passwordProtectedValidSpecification.isFail()) {
      return Result.fail(passwordProtectedValidSpecification.error());
    }

    const props: RegisteredFolderProps = {
      ...input,
      folderId: basicFolderProps.id,
      isPasswordProtected: basicFolderProps.isPasswordProtected,
      status: 'valid',
      registeredTimestamp: Timestamp.now(),
      updatedAtTimestamp: Timestamp.now(),
    };
    if (!basicFolderProps.isPasswordProtected) {
      props.lastValidPasswordTimestamp = null;
      props.password = null;
    }

    return Result.Ok(new RegisteredFolder(props));
  }

  static createWorngPasswordRegisteredFolder(
    input: Pick<RegisteredFolderProps, 'upn' | 'folderId'>,
  ): Result<RegisteredFolder, string> {
    return this.createInvalidRegisteredFolder({
      ...input,
      status: 'general-error',
      isPasswordProtected: true,
      password: null,
      lastValidPasswordTimestamp: null,
    });
  }

  static createGeneralErrorRegisteredFolder(
    input: Pick<
      RegisteredFolderProps,
      | 'upn'
      | 'folderId'
      | 'isPasswordProtected'
      | 'password'
      | 'lastValidPasswordTimestamp'
    >,
  ): Result<RegisteredFolder, string> {
    return this.createInvalidRegisteredFolder({
      ...input,
      status: 'general-error',
    });
  }

  static createNotFoundRegisteredFolder(
    input: Pick<
      RegisteredFolderProps,
      | 'upn'
      | 'folderId'
      | 'isPasswordProtected'
      | 'password'
      | 'lastValidPasswordTimestamp'
    >,
  ): Result<RegisteredFolder, string> {
    return this.createInvalidRegisteredFolder({
      ...input,
      status: 'not-found',
    });
  }

  static createLoadingRegisteredFolder(
    input: Pick<
      RegisteredFolderProps,
      | 'upn'
      | 'folderId'
      | 'isPasswordProtected'
      | 'password'
      | 'lastValidPasswordTimestamp'
    >,
  ): Result<RegisteredFolder, string> {
    return this.createInvalidRegisteredFolder({
      ...input,
      status: 'loading',
    });
  }

  private static createInvalidRegisteredFolder(
    input: Pick<
      RegisteredFolderProps,
      | 'upn'
      | 'folderId'
      | 'status'
      | 'isPasswordProtected'
      | 'password'
      | 'lastValidPasswordTimestamp'
    >,
  ): Result<RegisteredFolder, string> {
    const passwordProtectedValidSpecification =
      new PasswordProtectedValidSpecification().isSatisfiedBy({
        isPasswordProtected: input.isPasswordProtected,
        password: input.password,
        lastValidPasswordTimestamp: input.lastValidPasswordTimestamp,
      });

    if (passwordProtectedValidSpecification.isFail()) {
      return Result.fail(passwordProtectedValidSpecification.error());
    }

    return Result.Ok(
      new RegisteredFolder({
        ...input,
        folder: null,
        registeredTimestamp: Timestamp.now(),
        updatedAtTimestamp: Timestamp.now(),
      }),
    );
  }
}
