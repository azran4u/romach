import {
  EventEmitterInterface,
  EventHandler,
  IEvent,
} from '../../application/interfaces/event-handler-interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class InMemoryEventEmitter implements EventEmitterInterface {
  constructor(
    private eventEmitter: EventEmitter2,
    private topic: string,
  ) {}
  emit(event: IEvent): void {
    this.eventEmitter.emit(this.topic, event);
  }

  on(handler: EventHandler): void {
    this.eventEmitter.on(this.topic, handler);
  }
}
