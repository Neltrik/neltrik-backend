import { randomUUID } from "crypto";

import { UuidIdGenerator } from "./";

jest.mock("crypto", () => ({ randomUUID: jest.fn() }));

describe("UuidIdGenerator", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should generate a uuid", () => {
        (randomUUID as jest.Mock).mockReturnValue("123e4567-e89b-12d3-a456-426614174000");
        const generator = new UuidIdGenerator();
        expect(generator.generate()).toBe("123e4567-e89b-12d3-a456-426614174000");
        expect(randomUUID).toHaveBeenCalledTimes(1);
    });
});
