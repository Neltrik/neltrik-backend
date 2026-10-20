import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class NotificationNotFoundError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.NOTIFICATION_NOT_FOUND, DOMAIN_ERROR_CODES.NOTIFICATION_NOT_FOUND);
    }
}
