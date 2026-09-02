import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidExpirationDateError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_EXPIRATION_DATE, DOMAIN_ERROR_CODES.INVALID_EXPIRATION_DATE);
    }
}
