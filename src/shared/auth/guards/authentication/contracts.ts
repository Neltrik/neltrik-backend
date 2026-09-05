export abstract class SessionValidator {
    public abstract validate(sessionId: string): Promise<boolean>;
}
