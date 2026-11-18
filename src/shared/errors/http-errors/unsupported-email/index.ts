import { RESPONSE_CODES } from "@/shared/http";

import { DomainError } from "../../exceptions";

export class UnsupportedEmailProviderError extends DomainError {
    constructor(message: string = "Email provider is not supported.") {
        super(message, RESPONSE_CODES.UNSUPPORTED_EMAIL);
    }
}
