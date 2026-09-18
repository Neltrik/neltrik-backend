import { Audit } from ".";

describe("Audit", () => {
    it("should define the Audit decorator", () => {
        const decorator = Audit({ action: "", resource: "" });
        expect(decorator).toBeDefined();
    });
});
