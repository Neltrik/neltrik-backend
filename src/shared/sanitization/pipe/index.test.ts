import type { ArgumentMetadata } from "@nestjs/common";

import type { Sanitizable, SanitizationService } from "../service";
import { SanitizationPipe } from "./";

describe("SanitizationPipe", () => {
    const makeSut = () => {
        const sanitizationService = {
            sanitize: jest.fn(),
        } satisfies Pick<SanitizationService, "sanitize">;
        const pipe = new SanitizationPipe(sanitizationService);
        return { pipe, sanitizationService };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should sanitize body values", () => {
        const { pipe, sanitizationService } = makeSut();
        const value = { name: "<b>John</b>" };
        const sanitizedValue = { name: "John" };
        sanitizationService.sanitize.mockReturnValue(sanitizedValue);
        const metadata = { type: "body" } as ArgumentMetadata;
        const result = pipe.transform(value, metadata);
        expect(sanitizationService.sanitize).toHaveBeenCalledTimes(1);
        expect(sanitizationService.sanitize).toHaveBeenCalledWith(value);
        expect(result).toEqual(sanitizedValue);
    });

    it("should sanitize query values", () => {
        const { pipe, sanitizationService } = makeSut();
        const value = { search: "<script>alert(1)</script>" };
        sanitizationService.sanitize.mockReturnValue({ search: "alert(1)" });
        const metadata = { type: "query" } as ArgumentMetadata;
        pipe.transform(value, metadata);
        expect(sanitizationService.sanitize).toHaveBeenCalledWith(value);
    });

    it("should sanitize param values", () => {
        const { pipe, sanitizationService } = makeSut();
        const value = { id: "<b>123</b>" };
        sanitizationService.sanitize.mockReturnValue({ id: "123" });
        const metadata = { type: "param" } as ArgumentMetadata;
        pipe.transform(value, metadata);
        expect(sanitizationService.sanitize).toHaveBeenCalledWith(value);
    });

    it("should return the original value when metadata type is not supported", () => {
        const { pipe, sanitizationService } = makeSut();
        const value: Sanitizable = { name: "<b>John</b>" };
        const metadata = { type: "custom" } as ArgumentMetadata;
        const result = pipe.transform(value, metadata);
        expect(sanitizationService.sanitize).not.toHaveBeenCalled();
        expect(result).toBe(value);
    });
});
