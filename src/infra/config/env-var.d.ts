// env-var.d.ts
import ms from 'ms';

declare module 'env-var' {
  interface IPresentVariable {
    asMs(): number;
  }

  interface IOptionalVariable {
    asMs(): number;
  }

  interface IRequiredVariable {
    asMs(): number;
  }
}
