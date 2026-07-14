import { ERROR_MESSAGES } from "../messages";

export class InvalidSalaryError extends Error {
    constructor() {
        super(ERROR_MESSAGES.INVALID_SALARY);
        this.name = InvalidSalaryError.name;
    }
}
