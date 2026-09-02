import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class EmptyAccountIdError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EMPTY_AUTHENTICATION_ACCOUNT_ID, DOMAIN_ERROR_CODES.EMPTY_AUTHENTICATION_ACCOUNT_ID);
    }
}
