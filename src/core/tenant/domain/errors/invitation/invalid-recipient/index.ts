import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidRecipientError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_RECIPIENT, DOMAIN_ERROR_CODES.INVALID_RECIPIENT);
    }
}
