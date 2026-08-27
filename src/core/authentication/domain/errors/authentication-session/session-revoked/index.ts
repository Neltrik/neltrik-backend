import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class SessionRevokedError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.SESSION_REVOKED, DOMAIN_ERROR_CODES.SESSION_REVOKED);
    }
}
