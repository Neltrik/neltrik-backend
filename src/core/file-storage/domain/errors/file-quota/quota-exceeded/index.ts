import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class FileQuotaExceededError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.FILE_QUOTA_EXCEEDED, DOMAIN_ERROR_CODES.FILE_QUOTA_EXCEEDED);
    }
}
