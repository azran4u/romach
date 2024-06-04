import { of, EMPTY, Observable } from 'rxjs';
import { RxJsUtils } from './RxJsUtils';
import { finalize, toArray } from 'rxjs/operators';

describe('executeOnTrue', () => {
  const executeOnTrue = RxJsUtils.executeOnTrue;
  it('should execute operation when source emits true', (done) => {
    const source$ = of(true, true, true);
    const operation$ = of('operation executed');
    source$.pipe(executeOnTrue(operation$), toArray()).subscribe((values) => {
      expect(values).toEqual([
        'operation executed',
        'operation executed',
        'operation executed',
      ]);
      done();
    });
  });

  it('should not execute operation when source emits false', (done) => {
    const source$ = of(false, false, false);
    const operation$ = of('operation executed');
    source$.pipe(executeOnTrue(operation$), toArray()).subscribe((values) => {
      expect(values).toEqual([]);
      done();
    });
  });

  it('should execute operation only when source emits true', (done) => {
    const source$ = of(true, false, true, false, true);
    const operation$ = of('operation executed');
    source$.pipe(executeOnTrue(operation$), toArray()).subscribe((values) => {
      expect(values).toEqual([
        'operation executed',
        'operation executed',
        'operation executed',
      ]);
      done();
    });
  });

  it('verify the operation is terminated when source emits false', (done) => {
    const source$ = of(true, false, true, false);
    const operationCompleteSpy = jest.fn();
    const operation$ = of('operation executed').pipe(
      finalize(operationCompleteSpy),
    );
    source$.pipe(executeOnTrue(operation$), toArray()).subscribe((values) => {
      expect(values).toEqual(['operation executed', 'operation executed']);
      expect(operationCompleteSpy).toHaveBeenCalledTimes(2);
      done();
    });
  });
});
