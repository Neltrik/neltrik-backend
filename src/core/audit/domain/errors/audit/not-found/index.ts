import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class AuditEventNotFoundError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.AUDIT_EVENT_NOT_FOUND, DOMAIN_ERROR_CODES.AUDIT_EVENT_NOT_FOUND);
    }
}
