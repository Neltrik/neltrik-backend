import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidNotificationStatusError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_NOTIFICATION_STATUS, DOMAIN_ERROR_CODES.INVALID_NOTIFICATION_STATUS);
    }
}
