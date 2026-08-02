import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class UserAlreadyActiveError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.USER_ALREADY_ACTIVE, DOMAIN_ERROR_CODES.USER_ALREADY_ACTIVE);
    }
}
