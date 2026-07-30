import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class InvalidFirstNameError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_FIRST_NAME, DOMAIN_ERROR_CODES.INVALID_FIRST_NAME);
    }
}
