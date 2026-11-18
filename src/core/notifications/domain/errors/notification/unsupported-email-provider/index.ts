import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class UnsupportedEmailProviderError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.UNSUPPORTED_EMAIL_PROVIDER, DOMAIN_ERROR_CODES.UNSUPPORTED_EMAIL_PROVIDER);
    }
}
