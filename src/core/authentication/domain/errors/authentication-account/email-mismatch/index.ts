import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class EmailMismatchError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EMAIL_MISMATCH, DOMAIN_ERROR_CODES.EMAIL_MISMATCH);
    }
}
