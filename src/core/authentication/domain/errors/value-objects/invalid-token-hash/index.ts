import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidTokenHashError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_TOKEN_HASH, DOMAIN_ERROR_CODES.INVALID_TOKEN_HASH);
    }
}
