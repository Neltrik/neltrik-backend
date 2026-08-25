import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidCredentialsError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_CREDENTIALS, DOMAIN_ERROR_CODES.INVALID_CREDENTIALS);
    }
}
