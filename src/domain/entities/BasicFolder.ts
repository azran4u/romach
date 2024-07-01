import { ValidationResult } from '../../utils/ValidationUtils/ValidationResult';
import { ValidationUtils } from '../../utils/ValidationUtils/ValidationUtils';
import { Timestamp } from './Timestamp';
import { Result } from 'rich-domain';
import { z } from 'zod';

export interface BasicFolderProps {
  id: string;
  name: string;
  deleted: boolean;
  isLocal: boolean;
  isPasswordProtected: boolean;
  creationDate: string;
  updatedAt: string;
  categoryId: string;
}

export class BasicFolder {
  private props: BasicFolderProps;

  protected constructor(props: BasicFolderProps) {
    this.props = props;
  }
  static create(props: BasicFolderProps): Result<BasicFolder, string> {
    const validationResult = this.isValid(props);
    if (!validationResult.value())
      return Result.fail(validationResult.error().join('\n'));
    return Result.Ok(new BasicFolder(props));
  }

  getProps(): BasicFolderProps {
    return this.props;
  }

  private static isValid(props: BasicFolderProps): ValidationResult {
    const schema = z.object({
      id: ValidationUtils.MANDATORY_STRING,
      name: ValidationUtils.MANDATORY_STRING,
      categoryId: ValidationUtils.MANDATORY_STRING,
      deleted: z.boolean().default(false),
      isLocal: z.boolean().default(false),
      isPasswordProtected: z.boolean().default(false),
      creationDate: z.string().nullable(),
      updatedAt: z.string().default(Timestamp.now().toString()),
    });
    return ValidationUtils.calcValidation(props, schema);
  }
}
