import { ValidationResult } from './ValidationResult';
import { Result } from 'rich-domain';
import { z } from 'zod';

export class ValidationUtils {
  static calcValidation<T>(props: T, schema: any): ValidationResult {
    const result = schema.safeParse(props);
    if (result.success) {
      return Result.Ok(true);
    }
    return Result.fail(
      result.error.issues.map(
        (issue) => `field: ${issue.path.join('.')} error: ${issue.message}`,
      ),
    );
  }

  static MANDATORY_STRING = z.string().min(1);
}
