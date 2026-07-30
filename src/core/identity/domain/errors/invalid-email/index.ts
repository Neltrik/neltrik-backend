import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class InvalidEmailError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_EMAIL, DOMAIN_ERROR_CODES.INVALID_EMAIL);
    }
}
