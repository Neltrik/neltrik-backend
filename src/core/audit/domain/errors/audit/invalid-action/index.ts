import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidAuditActionError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_AUDIT_ACTION, DOMAIN_ERROR_CODES.INVALID_AUDIT_ACTION);
    }
}
