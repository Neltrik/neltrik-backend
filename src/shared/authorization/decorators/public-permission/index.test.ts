import { PublicPermission } from "./";

describe("PublicPermission", () => {
    it("should set public permission metadata to true", () => {
        const decorator = PublicPermission();
        expect(decorator).toBeDefined();
    });
});
