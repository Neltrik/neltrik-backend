import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class EmptyPasswordHashError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EMPTY_PASSWORD_HASH, DOMAIN_ERROR_CODES.EMPTY_PASSWORD_HASH);
    }
}
