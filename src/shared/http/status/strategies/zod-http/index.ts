import { HttpStatus, Injectable } from "@nestjs/common";

import { ZodValidationException } from "@/shared/zod";

import { HttpStatusStrategy } from "../../contracts";

@Injectable()
export class ZodHttpStatusStrategy extends HttpStatusStrategy {
    public supports(exception: unknown): boolean {
        return exception instanceof ZodValidationException;
    }

    public resolve(): number {
        return HttpStatus.BAD_REQUEST;
    }
}
