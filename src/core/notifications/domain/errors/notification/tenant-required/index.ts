import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class NotificationTenantRequiredError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.NOTIFICATION_TENANT_REQUIRED, DOMAIN_ERROR_CODES.NOTIFICATION_TENANT_REQUIRED);
    }
}
