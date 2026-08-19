import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class EmptyAuthenticationAccountUserIdError extends DomainError {
    constructor() {
        super(
            ERROR_MESSAGES.EMPTY_AUTHENTICATION_ACCOUNT_USER_ID,
            DOMAIN_ERROR_CODES.EMPTY_AUTHENTICATION_ACCOUNT_USER_ID,
        );
    }
}
