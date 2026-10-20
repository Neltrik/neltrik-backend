import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidNotificationTemplateCodeError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_NOTIFICATION_TEMPLATE_CODE, DOMAIN_ERROR_CODES.INVALID_NOTIFICATION_TEMPLATE_CODE);
    }
}
