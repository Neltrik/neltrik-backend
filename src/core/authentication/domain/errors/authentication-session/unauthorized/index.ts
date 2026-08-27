import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class UnauthorizedSessionError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.UNAUTHORIZED_SESSION, DOMAIN_ERROR_CODES.UNAUTHORIZED_SESSION);
    }
}
