import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class EmptyEmailError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.EMPTY_EMAIL, DOMAIN_ERROR_CODES.EMPTY_EMAIL);
    }
}
