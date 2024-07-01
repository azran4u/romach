export interface IEvent {
  type: string;
  payload: any;
}

export type EventHandler = (event: IEvent) => void;

export interface EventEmitterInterface {
  emit(event: IEvent): void;
  on(handler: EventHandler): void;
}
