import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class InvalidClosingDateError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_CLOSING_DATE, DOMAIN_ERROR_CODES.INVALID_CLOSING_DATE);
    }
}
