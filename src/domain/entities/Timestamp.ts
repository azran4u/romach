import { isDate } from 'lodash';

export class Timestamp {
  private constructor(private readonly timestamp: Date) {}

  static now(): Timestamp {
    return new Timestamp(new Date());
  }

  static fromString(timestamp: string): Timestamp {
    const timestampDate = new Date(timestamp);
    if (!isDate(timestampDate)) throw new Error('Invalid timestamp');
    return new Timestamp(timestampDate);
  }

  toString(): string {
    return this.timestamp.toISOString();
  }
}
