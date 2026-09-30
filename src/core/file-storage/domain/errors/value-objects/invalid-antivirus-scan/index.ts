import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidAntivirusScanError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_ANTIVIRUS_SCAN, DOMAIN_ERROR_CODES.INVALID_ANTIVIRUS_SCAN);
    }
}
