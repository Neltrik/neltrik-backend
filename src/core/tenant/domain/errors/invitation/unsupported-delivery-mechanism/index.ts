import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class UnsupportedDeliveryMechanismError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.UNSUPPORTED_DELIVERY_MECHANISM, DOMAIN_ERROR_CODES.UNSUPPORTED_DELIVERY_MECHANISM);
    }
}
