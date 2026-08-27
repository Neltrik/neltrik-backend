import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class ExpirationDateInPastError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EXPIRATION_DATE_IN_PAST, DOMAIN_ERROR_CODES.EXPIRATION_DATE_IN_PAST);
    }
}
