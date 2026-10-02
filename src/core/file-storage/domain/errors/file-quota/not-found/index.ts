import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class FileQuotaNotFoundError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.FILE_QUOTA_NOT_FOUND, DOMAIN_ERROR_CODES.FILE_QUOTA_NOT_FOUND);
    }
}
