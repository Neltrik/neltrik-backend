import { WithoutCompany } from "./";

describe("WithoutCompany", () => {
    it("should set without company metadata to true", () => {
        const decorator = WithoutCompany();
        expect(decorator).toBeDefined();
    });
});
