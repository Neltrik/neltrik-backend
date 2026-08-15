import { UserSuspensionPolicy } from "./index";

describe("UserSuspensionPolicy", () => {
    describe("canSuspend", () => {
        it("should allow a higher role to suspend a lower role", () => {
            expect(UserSuspensionPolicy.canSuspend("PLATFORM_ADMIN", "TENANT_OWNER")).toBe(true);
            expect(UserSuspensionPolicy.canSuspend("TENANT_OWNER", "TENANT_ADMIN")).toBe(true);
            expect(UserSuspensionPolicy.canSuspend("TENANT_ADMIN", "SUPPORT")).toBe(true);
        });

        it("should not allow a role to suspend an equal role", () => {
            expect(UserSuspensionPolicy.canSuspend("PLATFORM_ADMIN", "PLATFORM_ADMIN")).toBe(false);
            expect(UserSuspensionPolicy.canSuspend("TENANT_OWNER", "TENANT_OWNER")).toBe(false);
            expect(UserSuspensionPolicy.canSuspend("TENANT_ADMIN", "TENANT_ADMIN")).toBe(false);
            expect(UserSuspensionPolicy.canSuspend("RECRUITER", "SUPPORT")).toBe(false);
        });

        it("should not allow a lower role to suspend a higher role", () => {
            expect(UserSuspensionPolicy.canSuspend("TENANT_OWNER", "PLATFORM_ADMIN")).toBe(false);
            expect(UserSuspensionPolicy.canSuspend("TENANT_ADMIN", "TENANT_OWNER")).toBe(false);
            expect(UserSuspensionPolicy.canSuspend("RECRUITER", "TENANT_ADMIN")).toBe(false);
        });

        it("should treat roles without an explicit hierarchy as level zero", () => {
            expect(UserSuspensionPolicy.canSuspend("TENANT_ADMIN", "NEW_ROLE")).toBe(true);
            expect(UserSuspensionPolicy.canSuspend("NEW_ROLE", "TENANT_ADMIN")).toBe(false);
        });

        it("should not allow an unknown role to suspend another unknown role", () => {
            expect(UserSuspensionPolicy.canSuspend("NEW_ROLE_A", "NEW_ROLE_B")).toBe(false);
        });

        it("should allow PLATFORM_ADMIN to suspend any lower-level role", () => {
            expect(UserSuspensionPolicy.canSuspend("PLATFORM_ADMIN", "TENANT_OWNER")).toBe(true);
            expect(UserSuspensionPolicy.canSuspend("PLATFORM_ADMIN", "TENANT_ADMIN")).toBe(true);
            expect(UserSuspensionPolicy.canSuspend("PLATFORM_ADMIN", "RECRUITER")).toBe(true);
            expect(UserSuspensionPolicy.canSuspend("PLATFORM_ADMIN", "SUPPORT")).toBe(true);
            expect(UserSuspensionPolicy.canSuspend("PLATFORM_ADMIN", "NEW_ROLE")).toBe(true);
        });
    });
});
