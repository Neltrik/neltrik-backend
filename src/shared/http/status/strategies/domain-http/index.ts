import { HttpStatus, Injectable } from "@nestjs/common";

import { DomainError } from "@/shared/errors";

import { HttpStatusStrategy } from "../../contracts";
import { DomainStatusRegistry } from "../../domain-registry";

@Injectable()
export class DomainHttpStatusStrategy extends HttpStatusStrategy {
    public supports(exception: unknown): boolean {
        return exception instanceof DomainError;
    }

    public resolve(exception: unknown): number {
        if (!(exception instanceof DomainError)) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
        const status = DomainStatusRegistry.getStatus(exception.code);
        if (status !== undefined) {
            return status;
        }
        return HttpStatus.BAD_REQUEST;
    }
}
