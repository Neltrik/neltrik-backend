import { SkipEmailVerification } from "./";

describe("SkipEmailVerification", () => {
    it("should set skip email verification metadata to true", () => {
        const decorator = SkipEmailVerification();
        expect(decorator).toBeDefined();
    });
});
