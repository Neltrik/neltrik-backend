import { EmptyPasswordHashError } from "../../errors";
import { PasswordHash } from "./index";

describe("PasswordHash", () => {
    it("should create a valid password hash", () => {
        const passwordHash = PasswordHash.create("$argon2id$v=19$m=65536,t=3,p=4$hash");
        expect(passwordHash.value).toBe("$argon2id$v=19$m=65536,t=3,p=4$hash");
    });

    it("should preserve the hash value without transformations", () => {
        const hash = "  $argon2id$v=19$m=65536,t=3,p=4$hash  ";
        const passwordHash = PasswordHash.create(hash);
        expect(passwordHash.value).toBe(hash);
    });

    it("should throw EmptyPasswordHashError when password hash is empty", () => {
        expect(() => PasswordHash.create("")).toThrow(EmptyPasswordHashError);
    });

    it("should return true when comparing equal password hashes", () => {
        const passwordHash1 = PasswordHash.create("$argon2id$hash");
        const passwordHash2 = PasswordHash.create("$argon2id$hash");
        expect(passwordHash1.equals(passwordHash2)).toBe(true);
    });

    it("should return false when comparing different password hashes", () => {
        const passwordHash1 = PasswordHash.create("$argon2id$hash-one");
        const passwordHash2 = PasswordHash.create("$argon2id$hash-two");
        expect(passwordHash1.equals(passwordHash2)).toBe(false);
    });
});
