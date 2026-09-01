import { Permissions } from "./";

describe("Permissions", () => {
    it("should define the permissions decorator", () => {
        const decorator = Permissions("USER_CREATE", "USER_DELETE");
        expect(decorator).toBeDefined();
    });

    it("should define the permissions decorator without permissions", () => {
        const decorator = Permissions();
        expect(decorator).toBeDefined();
    });
});
