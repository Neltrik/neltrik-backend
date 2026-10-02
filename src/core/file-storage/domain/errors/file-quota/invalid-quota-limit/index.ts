import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidQuotaLimitError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_QUOTA_LIMIT, DOMAIN_ERROR_CODES.INVALID_QUOTA_LIMIT);
    }
}
