import { EventEmitterInterface } from '../interfaces/event-handler-interface';

export function eventEmitterMockBuilder(): EventEmitterInterface {
  return {
    emit: jest.fn(),
    on: jest.fn(),
  };
}
