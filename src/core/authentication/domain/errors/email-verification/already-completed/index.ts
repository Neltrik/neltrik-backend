import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class EmailVerificationAlreadyCompletedError extends DomainError {
    constructor() {
        super(
            ERROR_MESSAGES.EMAIL_VERIFICATION_ALREADY_COMPLETED,
            DOMAIN_ERROR_CODES.EMAIL_VERIFICATION_ALREADY_COMPLETED,
        );
    }
}
