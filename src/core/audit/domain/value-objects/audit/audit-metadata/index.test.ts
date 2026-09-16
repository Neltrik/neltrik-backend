import { InvalidAuditMetadataError } from "../../../errors";
import { AuditMetadata } from "./index";

describe("AuditMetadata", () => {
    it("should create valid audit metadata", () => {
        const metadata = AuditMetadata.create({ action: "LOGIN", source: "web" });
        expect(metadata.toJSON()).toEqual({ action: "LOGIN", source: "web" });
    });

    it("should create valid audit metadata with JSON primitive values", () => {
        const metadata = AuditMetadata.create({
            string: "value",
            number: 123,
            boolean: true,
            nullValue: null,
        });
        expect(metadata.toJSON()).toEqual({
            string: "value",
            number: 123,
            boolean: true,
            nullValue: null,
        });
    });

    it("should create valid audit metadata with nested objects", () => {
        const metadata = AuditMetadata.create({
            user: { id: 123, name: "John", active: true },
        });
        expect(metadata.toJSON()).toEqual({
            user: { id: 123, name: "John", active: true },
        });
    });

    it("should create valid audit metadata with arrays", () => {
        const metadata = AuditMetadata.create({ roles: ["admin", "user"], values: [1, true, null, "value"] });
        expect(metadata.toJSON()).toEqual({ roles: ["admin", "user"], values: [1, true, null, "value"] });
    });

    it("should throw InvalidAuditMetadataError when metadata is null", () => {
        expect(() => AuditMetadata.create(null)).toThrow(InvalidAuditMetadataError);
    });

    it("should throw InvalidAuditMetadataError when metadata is an array", () => {
        expect(() => AuditMetadata.create([] as unknown)).toThrow(InvalidAuditMetadataError);
    });

    it("should throw InvalidAuditMetadataError when metadata is not an object", () => {
        expect(() => AuditMetadata.create("metadata")).toThrow(InvalidAuditMetadataError);
    });

    it("should throw InvalidAuditMetadataError when metadata contains undefined", () => {
        expect(() => AuditMetadata.create({ action: undefined })).toThrow(InvalidAuditMetadataError);
    });

    it("should throw InvalidAuditMetadataError when metadata contains a function", () => {
        expect(() => AuditMetadata.create({ action: () => "LOGIN" })).toThrow(InvalidAuditMetadataError);
    });

    it("should throw InvalidAuditMetadataError when metadata contains a symbol", () => {
        expect(() => AuditMetadata.create({ action: Symbol("LOGIN") })).toThrow(InvalidAuditMetadataError);
    });

    it("should throw InvalidAuditMetadataError when metadata contains Infinity", () => {
        expect(() => AuditMetadata.create({ value: Infinity })).toThrow(InvalidAuditMetadataError);
    });

    it("should throw InvalidAuditMetadataError when metadata contains negative Infinity", () => {
        expect(() => AuditMetadata.create({ value: -Infinity })).toThrow(InvalidAuditMetadataError);
    });

    it("should throw InvalidAuditMetadataError when metadata contains NaN", () => {
        expect(() => AuditMetadata.create({ value: NaN })).toThrow(InvalidAuditMetadataError);
    });

    it("should throw InvalidAuditMetadataError when nested metadata contains an invalid value", () => {
        expect(() =>
            AuditMetadata.create({
                user: { name: "John", age: undefined },
            }),
        ).toThrow(InvalidAuditMetadataError);
    });

    it("should throw InvalidAuditMetadataError when an array contains an invalid value", () => {
        expect(() => AuditMetadata.create({ values: ["valid", undefined] })).toThrow(InvalidAuditMetadataError);
    });

    it("should return the metadata value by key", () => {
        const metadata = AuditMetadata.create({ action: "LOGIN", source: "web" });
        expect(metadata.get("action")).toBe("LOGIN");
    });

    it("should return undefined when key does not exist", () => {
        const metadata = AuditMetadata.create({ action: "LOGIN" });
        expect(metadata.get("source")).toBeUndefined();
    });

    it("should return true when key exists", () => {
        const metadata = AuditMetadata.create({ action: "LOGIN" });
        expect(metadata.has("action")).toBe(true);
    });

    it("should return false when key does not exist", () => {
        const metadata = AuditMetadata.create({ action: "LOGIN" });
        expect(metadata.has("source")).toBe(false);
    });

    it("should return a cloned metadata object", () => {
        const metadata = AuditMetadata.create({ action: "LOGIN", details: { source: "web" } });
        const result = metadata.toJSON();
        expect(result).toEqual({ action: "LOGIN", details: { source: "web" } });
        expect(result).not.toBe(metadata.toJSON());
    });

    it("should return a deep cloned metadata object", () => {
        const metadata = AuditMetadata.create({
            action: "LOGIN",
            details: { source: "web", permissions: ["read", "write"] },
        });
        const result = metadata.toJSON();
        expect(result).not.toBe(metadata.toJSON());
        expect(result.details).not.toBe(metadata.toJSON().details);
        expect((result.details as { permissions: string[] }).permissions).not.toBe(
            (metadata.toJSON().details as { permissions: string[] }).permissions,
        );
    });

    it("should not mutate metadata when the original object is modified", () => {
        const value = { action: "LOGIN" };
        const metadata = AuditMetadata.create(value);
        value.action = "LOGOUT";
        expect(metadata.get("action")).toBe("LOGIN");
    });

    it("should not mutate nested metadata when the original object is modified", () => {
        const value = { user: { name: "John" } };
        const metadata = AuditMetadata.create(value);
        value.user.name = "Jane";
        expect(metadata.get("user")).toEqual({ name: "John" });
    });

    it("should not mutate internal metadata when the result of toJSON is modified", () => {
        const metadata = AuditMetadata.create({ action: "LOGIN", details: { source: "web" } });
        const result = metadata.toJSON() as { action: string; details: { source: string } };
        result.action = "LOGOUT";
        result.details.source = "mobile";
        expect(metadata.get("action")).toBe("LOGIN");
        expect(metadata.get("details")).toEqual({ source: "web" });
    });

    it("should support generic typing when getting a value", () => {
        const metadata = AuditMetadata.create({ action: "LOGIN" });
        const action = metadata.get<string>("action");
        expect(action).toBe("LOGIN");
    });
});
