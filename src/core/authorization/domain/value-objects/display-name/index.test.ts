import { DisplayNameTooLongError, EmptyDisplayNameError } from "../../errors";
import { DisplayName } from "./index";

describe("DisplayName", () => {
    it("should create a valid display name", () => {
        const displayName = DisplayName.create("Administrador");
        expect(displayName.value).toBe("Administrador");
    });

    it("should trim leading and trailing spaces", () => {
        const displayName = DisplayName.create("   Administrador   ");
        expect(displayName.value).toBe("Administrador");
    });

    it("should throw EmptyDisplayNameError when display name is empty", () => {
        expect(() => DisplayName.create("")).toThrow(EmptyDisplayNameError);
    });

    it("should throw EmptyDisplayNameError when display name contains only spaces", () => {
        expect(() => DisplayName.create("     ")).toThrow(EmptyDisplayNameError);
    });

    it("should throw DisplayNameTooLongError when display name exceeds 100 characters", () => {
        const longDisplayName = "A".repeat(101);
        expect(() => DisplayName.create(longDisplayName)).toThrow(DisplayNameTooLongError);
    });

    it("should return true when comparing equal display names", () => {
        const displayName1 = DisplayName.create("Administrador");
        const displayName2 = DisplayName.create("Administrador");
        expect(displayName1.equals(displayName2)).toBe(true);
    });

    it("should return false when comparing different display names", () => {
        const displayName1 = DisplayName.create("Administrador");
        const displayName2 = DisplayName.create("Supervisor");
        expect(displayName1.equals(displayName2)).toBe(false);
    });
});
