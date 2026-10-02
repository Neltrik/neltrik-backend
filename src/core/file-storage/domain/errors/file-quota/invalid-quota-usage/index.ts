import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidQuotaUsageError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_QUOTA_USAGE, DOMAIN_ERROR_CODES.INVALID_QUOTA_USAGE);
    }
}
