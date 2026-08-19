import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class AuthenticationAccountAlreadyExistsError extends DomainError {
    constructor() {
        super(
            ERROR_MESSAGES.AUTHENTICATION_ACCOUNT_ALREADY_EXISTS,
            DOMAIN_ERROR_CODES.AUTHENTICATION_ACCOUNT_ALREADY_EXISTS,
        );
    }
}
