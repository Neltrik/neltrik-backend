import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class NotificationPreferenceOwnerRequiredError extends DomainError {
    constructor() {
        super(
            ERROR_MESSAGES.NOTIFICATION_PREFERENCE_OWNER_REQUIRED,
            DOMAIN_ERROR_CODES.NOTIFICATION_PREFERENCE_OWNER_REQUIRED,
        );
    }
}
