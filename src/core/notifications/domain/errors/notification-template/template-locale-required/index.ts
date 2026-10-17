import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class NotificationTemplateLocaleRequiredError extends DomainError {
    constructor() {
        super(
            ERROR_MESSAGES.NOTIFICATION_TEMPLATE_LOCALE_REQUIRED,
            DOMAIN_ERROR_CODES.NOTIFICATION_TEMPLATE_LOCALE_REQUIRED,
        );
    }
}
