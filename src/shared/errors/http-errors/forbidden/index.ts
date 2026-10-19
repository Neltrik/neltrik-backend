import { RESPONSE_CODES } from "@/shared/http";

import { DomainError } from "../../exceptions";

export class ForbiddenError extends DomainError {
    constructor(message: string = "You are not allowed to perform this action") {
        super(message, RESPONSE_CODES.FORBIDDEN);
    }
}
