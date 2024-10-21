import { Result } from "rich-domain";
import { AppLoggerService } from "src/infra/logging/app-logger.service";

export class RetryUtils {
    constructor(private readonly logger: AppLoggerService) { }

    async retry<T>(
        fn: () => Promise<Result<T>>,
        maxRetry: number,
    ): Promise<Result<T>> {
        let retryCount = 0;
        while (retryCount < maxRetry) {
            const result = await fn();
            if (result.isOk()) {
                return result;
            } else {
                this.logger.error(
                    `try #${retryCount} of ${maxRetry} failed with error: ${result.error()}`,
                );
            }
            retryCount++;
        }
        return Result.fail('max retry reached');
    }
}
