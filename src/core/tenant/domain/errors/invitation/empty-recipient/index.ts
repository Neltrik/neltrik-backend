import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class EmptyRecipientError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EMPTY_RECIPIENT, DOMAIN_ERROR_CODES.EMPTY_RECIPIENT);
    }
}
