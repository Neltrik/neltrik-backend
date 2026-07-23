import { type ArgumentMetadata, BadRequestException } from "@nestjs/common";
import { z } from "zod";

import { ZodValidationPipe } from "./";

describe("ZodValidationPipe", () => {
    const makeSut = () => {
        const schema = z.object({
            id: z.uuid(),
        });
        return new ZodValidationPipe(schema);
    };

    const metadata = {} as ArgumentMetadata;

    it("should return parsed data when validation succeeds", () => {
        const sut = makeSut();
        const value = { id: "123e4567-e89b-12d3-a456-426614174000" };
        const result = sut.transform(value, metadata);
        expect(result).toEqual(value);
    });

    it("should throw BadRequestException when validation fails", () => {
        const sut = makeSut();
        const value = { id: "invalid-id" };
        expect(() => sut.transform(value, metadata)).toThrow(BadRequestException);
    });
});
