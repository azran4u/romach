import { EMPTY, Observable, OperatorFunction, switchMap } from "rxjs";

export class RxJsUtils {
    static executeOnTrue<R>(operation: Observable<R>): OperatorFunction<boolean, R> {
        return (source: Observable<boolean>) => source.pipe(
          switchMap((value: any) => value ? operation : EMPTY)
        );
      }
}