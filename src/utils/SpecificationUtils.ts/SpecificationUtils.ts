import { Result } from 'rich-domain';

export interface ISpecification<T> {
  isSatisfiedBy(candidate: T): Result<boolean, string>;
}
