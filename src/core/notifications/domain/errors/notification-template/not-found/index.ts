import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class NotificationTemplateNotFoundError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.NOTIFICATION_TEMPLATE_NOT_FOUND, DOMAIN_ERROR_CODES.NOTIFICATION_TEMPLATE_NOT_FOUND);
    }
}
