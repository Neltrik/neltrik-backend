import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidRefreshTokenError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_REFRESH_TOKEN, DOMAIN_ERROR_CODES.INVALID_REFRESH_TOKEN);
    }
}
