export class InvalidSalaryError extends Error {
    constructor() {
        super("Salary cannot be negative.");
        this.name = "InvalidSalaryError";
    }
}
