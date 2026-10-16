import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class NotificationCodeRequiredError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.NOTIFICATION_CODE_REQUIRED, DOMAIN_ERROR_CODES.NOTIFICATION_CODE_REQUIRED);
    }
}
