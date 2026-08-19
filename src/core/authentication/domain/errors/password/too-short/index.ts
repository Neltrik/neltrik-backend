import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class PasswordTooShortError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.PASSWORD_TOO_SHORT, DOMAIN_ERROR_CODES.PASSWORD_TOO_SHORT);
    }
}
