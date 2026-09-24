import { SkipTenantState } from "./";

describe("SkipTenantState", () => {
    it("should set skip user state metadata to true", () => {
        const decorator = SkipTenantState();
        expect(decorator).toBeDefined();
    });
});
