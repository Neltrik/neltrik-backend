import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidAuditMetadataError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_AUDIT_METADATA, DOMAIN_ERROR_CODES.INVALID_AUDIT_METADATA);
    }
}
