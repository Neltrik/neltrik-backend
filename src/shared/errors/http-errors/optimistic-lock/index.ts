import { RESPONSE_CODES } from "@/shared/http";

import { DomainError } from "../../exceptions";

export class OptimisticLockError extends DomainError {
    constructor() {
        super("The record was modified by another user. Please refresh and try again.", RESPONSE_CODES.OPTIMISTIC_LOCK);
    }
}
