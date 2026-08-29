import { Public } from "./";

describe("Public", () => {
    it("should set isPublic metadata to true", () => {
        const decorator = Public();
        expect(decorator).toBeDefined();
    });
});
