import { EventEmitter } from "node:events";
import { IOrganizationResponseDTO } from "../interfaces";
import { OrganizationChangeSetItem } from "../utils";

export enum OrganizationEventName {
  CREATED = "organization.created",
  UPDATED = "organization.updated",
  SOFT_DELETED = "organization.soft-deleted",
  RESTORED = "organization.restored",
  BULK_STATUS_UPDATED = "organization.bulk-status-updated",
  BULK_SOFT_DELETED = "organization.bulk-soft-deleted",
}

export interface OrganizationEventContext {
  actorAccountId: string;
  occurredAt: string;
}

export interface OrganizationCreatedEvent {
  context: OrganizationEventContext;
  organization: IOrganizationResponseDTO;
}

export interface OrganizationUpdatedEvent {
  context: OrganizationEventContext;
  organization: IOrganizationResponseDTO;
  changes: OrganizationChangeSetItem[];
}

export interface OrganizationSoftDeletedEvent {
  context: OrganizationEventContext;
  organization: IOrganizationResponseDTO;
}

export interface OrganizationRestoredEvent {
  context: OrganizationEventContext;
  organization: IOrganizationResponseDTO;
}

export interface OrganizationBulkStatusUpdatedEvent {
  context: OrganizationEventContext;
  matchedCount: number;
  modifiedCount: number;
}

export interface OrganizationBulkSoftDeletedEvent {
  context: OrganizationEventContext;
  matchedCount: number;
  modifiedCount: number;
}

export interface OrganizationEventPayloadMap {
  [OrganizationEventName.CREATED]: OrganizationCreatedEvent;
  [OrganizationEventName.UPDATED]: OrganizationUpdatedEvent;
  [OrganizationEventName.SOFT_DELETED]: OrganizationSoftDeletedEvent;
  [OrganizationEventName.RESTORED]: OrganizationRestoredEvent;
  [OrganizationEventName.BULK_STATUS_UPDATED]: OrganizationBulkStatusUpdatedEvent;
  [OrganizationEventName.BULK_SOFT_DELETED]: OrganizationBulkSoftDeletedEvent;
}

/**
 * Service: Organization Events
 * Objective: Centralize typed domain event publishing/subscription for organization lifecycle.
 */
export class OrganizationEventsService {
  private readonly emitter = new EventEmitter();

  emit<TEventName extends keyof OrganizationEventPayloadMap>(
    eventName: TEventName,
    payload: OrganizationEventPayloadMap[TEventName],
  ): void {
    this.emitter.emit(eventName, payload);
  }

  on<TEventName extends keyof OrganizationEventPayloadMap>(
    eventName: TEventName,
    listener: (payload: OrganizationEventPayloadMap[TEventName]) => void,
  ): void {
    this.emitter.on(eventName, listener);
  }

  off<TEventName extends keyof OrganizationEventPayloadMap>(
    eventName: TEventName,
    listener: (payload: OrganizationEventPayloadMap[TEventName]) => void,
  ): void {
    this.emitter.off(eventName, listener);
  }
}

export const organizationEvents = new OrganizationEventsService();
