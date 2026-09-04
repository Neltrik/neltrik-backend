import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class PasswordResetNotFoundError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.PASSWORD_RESET_NOT_FOUND, DOMAIN_ERROR_CODES.PASSWORD_RESET_NOT_FOUND);
    }
}
