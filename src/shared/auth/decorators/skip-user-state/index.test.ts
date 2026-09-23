import { SkipUserState } from "./";

describe("SkipUserState", () => {
    it("should set skip user state metadata to true", () => {
        const decorator = SkipUserState();
        expect(decorator).toBeDefined();
    });
});
