import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class SessionExpiredError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.SESSION_EXPIRED, DOMAIN_ERROR_CODES.SESSION_EXPIRED);
    }
}
