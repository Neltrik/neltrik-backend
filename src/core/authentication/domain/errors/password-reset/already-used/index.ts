import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class PasswordResetAlreadyUsedError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.PASSWORD_RESET_ALREADY_USED, DOMAIN_ERROR_CODES.PASSWORD_RESET_ALREADY_USED);
    }
}
