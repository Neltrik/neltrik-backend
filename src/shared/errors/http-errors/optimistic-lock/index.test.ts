import { RESPONSE_CODES } from "@/shared/http";

import { OptimisticLockError } from "./index";

describe("OptimisticLockError", () => {
    it("should create an optimistic lock error with the expected message and response code", () => {
        const error = new OptimisticLockError();
        expect(error).toBeInstanceOf(OptimisticLockError);
        expect(error.message).toBe("The record was modified by another user. Please refresh and try again.");
        expect(error.code).toBe(RESPONSE_CODES.OPTIMISTIC_LOCK);
    });
});
