import { beforeEach, describe, expect, it, vi } from "vitest";

const mockConnect = vi.fn();
const mockDisconnect = vi.fn();
const mockConnection = { readyState: 0 };

vi.mock("mongoose", () => ({
  default: {
    connect: mockConnect,
    disconnect: mockDisconnect,
    connection: mockConnection,
  },
}));

vi.mock("./env", () => ({
  env: {
    mongoUri: "mongodb://localhost:27017/test-db",
  },
}));

beforeEach(() => {
  mockConnect.mockReset();
  mockDisconnect.mockReset();
  mockConnection.readyState = 0;
});

describe("mongo config", () => {
  it("connects using configured mongo uri", async () => {
    const { connectMongo } = await import("./mongo");

    await connectMongo();

    expect(mockConnect).toHaveBeenCalledWith(
      "mongodb://localhost:27017/test-db",
    );
  });

  it("disconnects only when connected", async () => {
    const { disconnectMongo } = await import("./mongo");

    mockConnection.readyState = 1;
    await disconnectMongo();
    expect(mockDisconnect).toHaveBeenCalledTimes(1);

    mockDisconnect.mockReset();
    mockConnection.readyState = 0;
    await disconnectMongo();
    expect(mockDisconnect).not.toHaveBeenCalled();
  });

  it("returns readable mongo connection state", async () => {
    const { getMongoConnectionState } = await import("./mongo");

    mockConnection.readyState = 0;
    expect(getMongoConnectionState()).toBe("disconnected");

    mockConnection.readyState = 1;
    expect(getMongoConnectionState()).toBe("connected");

    mockConnection.readyState = 2;
    expect(getMongoConnectionState()).toBe("connecting");

    mockConnection.readyState = 3;
    expect(getMongoConnectionState()).toBe("disconnecting");

    mockConnection.readyState = 99;
    expect(getMongoConnectionState()).toBe("unknown");
  });
});
