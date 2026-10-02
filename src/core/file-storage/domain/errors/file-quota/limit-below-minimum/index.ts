import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class QuotaLimitBelowMinimumError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.QUOTA_LIMIT_BELOW_MINIMUM, DOMAIN_ERROR_CODES.QUOTA_LIMIT_BELOW_MINIMUM);
    }
}
