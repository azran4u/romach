import { isDate } from 'lodash';

export class Timestamp {
  private constructor(private readonly timestamp: Date) {}

  static now(): Timestamp {
    return new Timestamp(new Date());
  }

  static ts1970(): Timestamp {
    return new Timestamp(new Date(0));
  }

  static fromString(timestamp: string): Timestamp {
    const timestampDate = new Date(timestamp);
    if (!isDate(timestampDate)) throw new Error('Invalid timestamp');
    return new Timestamp(timestampDate);
  }

  toString(): string {
    return this.timestamp.toISOString();
  }

  toNumber(): number {
    return this.timestamp.getTime();
  }
}
