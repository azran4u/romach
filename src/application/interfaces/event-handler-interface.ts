import { BasicFolder } from "src/domain/entities/BasicFolder";
import { Hierarchy } from "src/domain/entities/Hierarchy";

export type EventType = 'BASIC_FOLDERS_UPDATED' | 'HIERARCHY_UPDATED';

export interface IEvent<T> {
  type: EventType;
  payload: T
}

export interface BasicFoldersUpdatedEvent extends IEvent<BasicFolder[]> {
  type: 'BASIC_FOLDERS_UPDATED'
}

export interface HierarchyUpdatedEvent extends IEvent<{ hierarchy: Hierarchy[] }> {
  type: 'HIERARCHY_UPDATED',
}

export type Event = BasicFoldersUpdatedEvent | HierarchyUpdatedEvent;

export type EventHandler = (event: Event) => void;

export interface EventEmitterInterface {
  emit(event: Event): void;
  on(handler: EventHandler): void;
}