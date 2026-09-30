import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidMimeTypeError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_MIME_TYPE, DOMAIN_ERROR_CODES.INVALID_MIME_TYPE);
    }
}
