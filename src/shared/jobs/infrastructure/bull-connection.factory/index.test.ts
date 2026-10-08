import { Redis } from "ioredis";

import { createBullConnection } from "./";

jest.mock("ioredis", () => ({
    Redis: jest.fn().mockImplementation(() => ({})),
}));

describe("createBullConnection", () => {
    it("should create a Redis connection", () => {
        createBullConnection();
        expect(Redis).toHaveBeenCalledWith(expect.any(String), {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
        });
    });
});
