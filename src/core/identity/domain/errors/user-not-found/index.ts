import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../messages";

export class UserNotFoundError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.USER_NOT_FOUND, DOMAIN_ERROR_CODES.USER_NOT_FOUND);
    }
}
