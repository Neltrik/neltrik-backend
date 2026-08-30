import { RESPONSE_CODES } from "@/shared/http";

import { DomainError } from "../../exceptions";

export class UnauthorizedError extends DomainError {
    constructor(message: string = "Unauthorized.") {
        super(message, RESPONSE_CODES.UNAUTHORIZED);
    }
}
