export type EmailMessage = {
    to: string;
    subject: string;
    body: string;
    html?: string;
};

export abstract class EmailSender {
    abstract send(message: EmailMessage): Promise<void>;
}
