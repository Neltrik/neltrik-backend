import { HttpStatus } from "@nestjs/common";

import { DomainStatusRegistry } from "./";

describe("DomainStatusRegistry", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should return undefined when the domain error code is not registered", () => {
        const result = DomainStatusRegistry.getStatus("UNKNOWN_DOMAIN_ERROR");
        expect(result).toBeUndefined();
    });

    it("should return the registered status for a domain error code", () => {
        DomainStatusRegistry.register("TEST_DOMAIN_ERROR", HttpStatus.NOT_FOUND);
        const result = DomainStatusRegistry.getStatus("TEST_DOMAIN_ERROR");
        expect(result).toBe(HttpStatus.NOT_FOUND);
    });

    it("should update the status when the domain error code is registered again", () => {
        DomainStatusRegistry.register("TEST_DOMAIN_ERROR", HttpStatus.BAD_REQUEST);
        DomainStatusRegistry.register("TEST_DOMAIN_ERROR", HttpStatus.NOT_FOUND);
        const result = DomainStatusRegistry.getStatus("TEST_DOMAIN_ERROR");
        expect(result).toBe(HttpStatus.NOT_FOUND);
    });

    it("should register different statuses for different domain error codes", () => {
        DomainStatusRegistry.register("VALIDATION_ERROR", HttpStatus.BAD_REQUEST);
        DomainStatusRegistry.register("NOT_FOUND_ERROR", HttpStatus.NOT_FOUND);
        const validationResult = DomainStatusRegistry.getStatus("VALIDATION_ERROR");
        const notFoundResult = DomainStatusRegistry.getStatus("NOT_FOUND_ERROR");
        expect(validationResult).toBe(HttpStatus.BAD_REQUEST);
        expect(notFoundResult).toBe(HttpStatus.NOT_FOUND);
    });

    it("should return undefined for an unregistered code after registering another code", () => {
        DomainStatusRegistry.register("TEST_DOMAIN_ERROR", HttpStatus.NOT_FOUND);
        const result = DomainStatusRegistry.getStatus("UNKNOWN_DOMAIN_ERROR");
        expect(result).toBeUndefined();
    });
});
