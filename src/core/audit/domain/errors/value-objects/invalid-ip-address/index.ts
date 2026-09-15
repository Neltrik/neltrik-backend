import { DomainError } from "@/shared/errors";

import { DOMAIN_ERROR_CODES, ERROR_MESSAGES } from "../../messages";

export class InvalidIpAddressError extends DomainError {
    constructor() {
        super(ERROR_MESSAGES.INVALID_IP_ADDRESS, DOMAIN_ERROR_CODES.INVALID_IP_ADDRESS);
    }
}
