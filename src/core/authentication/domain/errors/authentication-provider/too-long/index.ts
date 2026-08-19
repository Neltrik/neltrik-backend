import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class AuthenticationProviderTooLongError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.AUTHENTICATION_PROVIDER_TOO_LONG, DOMAIN_ERROR_CODES.AUTHENTICATION_PROVIDER_TOO_LONG);
    }
}
