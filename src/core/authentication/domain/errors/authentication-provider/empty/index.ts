import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class EmptyAuthenticationProviderError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EMPTY_AUTHENTICATION_PROVIDER, DOMAIN_ERROR_CODES.EMPTY_AUTHENTICATION_PROVIDER);
    }
}
