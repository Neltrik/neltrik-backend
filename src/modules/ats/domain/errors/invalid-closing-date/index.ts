export class InvalidClosingDateError extends Error {
    constructor() {
        super("Closing date must be after created date.");
        this.name = "InvalidClosingDateError";
    }
}
