import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class FileNotReadyError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.FILE_NOT_READY, DOMAIN_ERROR_CODES.FILE_NOT_READY);
    }
}
