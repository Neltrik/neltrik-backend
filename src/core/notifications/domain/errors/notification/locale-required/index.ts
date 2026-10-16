import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class NotificationLocaleRequiredError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.NOTIFICATION_LOCALE_REQUIRED, DOMAIN_ERROR_CODES.NOTIFICATION_LOCALE_REQUIRED);
    }
}
