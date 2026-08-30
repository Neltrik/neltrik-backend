import { BadRequestException } from "@nestjs/common";
import { type ZodError } from "zod";

export class ZodValidationException extends BadRequestException {
    public readonly zodError: ZodError;

    constructor(zodError: ZodError) {
        super({
            message: "Validation failed.",
            errors: zodError.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
        this.zodError = zodError;
    }
}
