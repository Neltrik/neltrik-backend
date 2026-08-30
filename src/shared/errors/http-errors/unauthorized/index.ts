import { DomainError } from "../../exceptions";

export class UnauthorizedError extends DomainError {
    constructor(message: string = "Unauthorized.") {
        super(message, "UNAUTHORIZED");
    }
}
