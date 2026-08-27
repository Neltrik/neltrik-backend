import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class SessionNotFoundError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.SESSION_NOT_FOUND, DOMAIN_ERROR_CODES.SESSION_NOT_FOUND);
    }
}
