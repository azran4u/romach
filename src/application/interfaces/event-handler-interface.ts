export type EventTypes = 'BASIC_FOLDERS_UPDATED' | 'HIERARCHY_UPDATED';
export interface IEvent {
  type: EventTypes;
  payload: any;
}

export type EventHandler = (event: IEvent) => void;

export interface EventEmitterInterface {
  emit(event: IEvent): void;
  on(handler: EventHandler): void;
}
