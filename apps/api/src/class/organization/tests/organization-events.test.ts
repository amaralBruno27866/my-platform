import { describe, expect, it, vi } from "vitest";
import { OrganizationEventName, OrganizationEventsService } from "../events";

describe("organization events service", () => {
  it("subscribes, emits and unsubscribes listeners", () => {
    const events = new OrganizationEventsService();
    const listener = vi.fn();

    events.on(OrganizationEventName.BULK_STATUS_UPDATED, listener);
    events.emit(OrganizationEventName.BULK_STATUS_UPDATED, {
      context: {
        actorAccountId: "507f191e810c19729de860ea",
        occurredAt: new Date().toISOString(),
      },
      matchedCount: 2,
      modifiedCount: 2,
    });

    expect(listener).toHaveBeenCalledTimes(1);

    events.off(OrganizationEventName.BULK_STATUS_UPDATED, listener);
    events.emit(OrganizationEventName.BULK_STATUS_UPDATED, {
      context: {
        actorAccountId: "507f191e810c19729de860ea",
        occurredAt: new Date().toISOString(),
      },
      matchedCount: 1,
      modifiedCount: 1,
    });

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
