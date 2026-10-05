import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidFileMagicBytesError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.FILE_MIME_TYPE_MISMATCH, DOMAIN_ERROR_CODES.FILE_MIME_TYPE_MISMATCH);
    }
}
