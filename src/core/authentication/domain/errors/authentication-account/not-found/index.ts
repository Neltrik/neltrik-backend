import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class AuthenticationAccountNotFoundError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.AUTHENTICATION_ACCOUNT_NOT_FOUND, DOMAIN_ERROR_CODES.AUTHENTICATION_ACCOUNT_NOT_FOUND);
    }
}
