import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class NotificationRecipientRequiredError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.NOTIFICATION_RECIPIENT_REQUIRED, DOMAIN_ERROR_CODES.NOTIFICATION_RECIPIENT_REQUIRED);
    }
}
