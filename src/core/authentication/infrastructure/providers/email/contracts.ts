export abstract class EmailSender {
    abstract sendVerificationEmail(to: string, token: string): Promise<void>;
    abstract sendPasswordResetEmail(to: string, token: string): Promise<void>;
}
