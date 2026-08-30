import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { ZodType } from "zod";

import { ZodValidationException } from "../exception";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private readonly schema: ZodType) {}

    transform(value: unknown, _metadata: ArgumentMetadata) {
        const result = this.schema.safeParse(value);
        if (!result.success) {
            throw new ZodValidationException(result.error);
        }
        return result.data;
    }
}
