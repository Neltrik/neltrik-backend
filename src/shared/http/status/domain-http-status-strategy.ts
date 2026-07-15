import { HttpStatus, Injectable } from "@nestjs/common";

import { DomainError } from "@/shared/errors";

import { HttpStatusStrategy } from "./http-status-strategy";

@Injectable()
export class DomainHttpStatusStrategy extends HttpStatusStrategy {
    public supports(exception: unknown): boolean {
        return exception instanceof DomainError;
    }

    public resolve(): number {
        return HttpStatus.BAD_REQUEST;
    }
}
