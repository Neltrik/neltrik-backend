import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class FileAlreadyExistsError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.FILE_ALREADY_EXISTS, DOMAIN_ERROR_CODES.FILE_ALREADY_EXISTS);
    }
}
