import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class NotificationTemplateBodyRequiredError extends DomainError {
    constructor() {
        super(
            ERROR_MESSAGES.NOTIFICATION_TEMPLATE_BODY_REQUIRED,
            DOMAIN_ERROR_CODES.NOTIFICATION_TEMPLATE_BODY_REQUIRED,
        );
    }
}
