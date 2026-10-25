import { SKIP_SANITIZATION_KEY, SkipSanitization } from "./";

describe("SkipSanitization", () => {
    it("should define the skip sanitization decorator", () => {
        const decorator = SkipSanitization();
        expect(decorator).toBeDefined();
    });

    it("should define the correct metadata key", () => {
        expect(SKIP_SANITIZATION_KEY).toBe("skip_sanitization");
    });

    it("should set the skip sanitization metadata to true", () => {
        const decorator = SkipSanitization();
        const target = {};
        decorator(target, "testMethod", Object.getOwnPropertyDescriptor(target, "testMethod")!);
    });
});
