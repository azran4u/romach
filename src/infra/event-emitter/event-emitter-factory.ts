import { EventEmitterInterface } from '../../application/interfaces/event-handler-interface';
import { InMemoryEventEmitter } from './in-memory-event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';

export type EventEmitterTopic = 'folder-changes' | 'hierarchy-changes';

@Injectable()
export class EventEmitterFactory {
  private perRealityMap: Map<
    string,
    Map<EventEmitterTopic, EventEmitterInterface>
  >;

  constructor(private eventEmitter: EventEmitter2) {
    this.perRealityMap = new Map<
      string,
      Map<EventEmitterTopic, EventEmitterInterface>
    >();
  }

  create(topic: EventEmitterTopic, reality: string): EventEmitterInterface {
    if (
      this.perRealityMap.has(reality) &&
      this.perRealityMap.get(reality).has(topic)
    )
      return this.perRealityMap.get(reality).get(topic);

    const emitter = new InMemoryEventEmitter(
      this.eventEmitter,
      `${reality}-${topic}`,
    );

    if (!this.perRealityMap.has(reality))
      this.perRealityMap.set(reality, new Map());

    const realityMap = this.perRealityMap.get(reality);

    if (!realityMap.has(topic)) realityMap.set(topic, emitter);

    return emitter;
  }
}
