import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class UserAlreadySuspendedError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.USER_ALREADY_SUSPENDED, DOMAIN_ERROR_CODES.USER_ALREADY_SUSPENDED);
    }
}
