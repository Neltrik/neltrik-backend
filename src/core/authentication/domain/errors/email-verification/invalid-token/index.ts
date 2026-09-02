import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidTokenError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_TOKEN, DOMAIN_ERROR_CODES.INVALID_TOKEN);
    }
}
