import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class NotificationRecipientEmailRequiredError extends DomainError {
    constructor() {
        super(
            ERROR_MESSAGES.NOTIFICATION_RECIPIENT_EMAIL_REQUIRED,
            DOMAIN_ERROR_CODES.NOTIFICATION_RECIPIENT_EMAIL_REQUIRED,
        );
    }
}
