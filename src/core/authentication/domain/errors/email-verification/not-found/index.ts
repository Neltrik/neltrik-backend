import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class EmailVerificationNotFoundError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EMAIL_VERIFICATION_NOT_FOUND, DOMAIN_ERROR_CODES.EMAIL_VERIFICATION_NOT_FOUND);
    }
}
