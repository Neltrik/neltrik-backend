import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class InvalidLastNameError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_LAST_NAME, DOMAIN_ERROR_CODES.INVALID_LAST_NAME);
    }
}
