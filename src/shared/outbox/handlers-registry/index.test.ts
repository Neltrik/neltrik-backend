import { type OutboxHandler } from "../contracts";
import { HandlersRegistry } from ".";

describe("HandlersRegistry", () => {
    let handlersRegistry: HandlersRegistry;
    let outboxHandler: OutboxHandler;

    beforeEach(() => {
        outboxHandler = { eventType: "USER_CREATED" } as OutboxHandler;
        handlersRegistry = new HandlersRegistry();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should register handler", () => {
        handlersRegistry.register(outboxHandler);
        expect(handlersRegistry.get("USER_CREATED")).toBe(outboxHandler);
    });

    it("should return registered handler", () => {
        handlersRegistry.register(outboxHandler);
        expect(handlersRegistry.get("USER_CREATED")).toBe(outboxHandler);
    });

    it("should return undefined when handler is not registered", () => {
        expect(handlersRegistry.get("USER_CREATED")).toBeUndefined();
    });

    it("should overwrite existing handler when registering the same event type", () => {
        const anotherHandler = { eventType: "USER_CREATED" } as OutboxHandler;
        handlersRegistry.register(outboxHandler);
        handlersRegistry.register(anotherHandler);
        expect(handlersRegistry.get("USER_CREATED")).toBe(anotherHandler);
    });

    it("should register handlers for different event types independently", () => {
        const anotherHandler = { eventType: "USER_UPDATED" } as OutboxHandler;
        handlersRegistry.register(outboxHandler);
        handlersRegistry.register(anotherHandler);
        expect(handlersRegistry.get("USER_CREATED")).toBe(outboxHandler);
        expect(handlersRegistry.get("USER_UPDATED")).toBe(anotherHandler);
    });
});
