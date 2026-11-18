import { Injectable } from "@nestjs/common";
import { convert } from "html-to-text";
import * as nodemailer from "nodemailer";

import { env } from "@/config/env";

import { EmailMessage, EmailSender } from "./contracts";

@Injectable()
export class NodemailerEmailSender extends EmailSender {
    private readonly transporter: nodemailer.Transporter;

    constructor() {
        super();
        this.transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_SECURE,
            auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
        });
    }

    public async send(message: EmailMessage): Promise<void> {
        const text = convert(message.html ?? message.body, { wordwrap: 130 });
        await this.transporter.sendMail({
            from: env.SMTP_FROM,
            to: message.to,
            subject: message.subject,
            text,
            html: message.html,
        });
    }
}

export { type EmailMessage, EmailSender };
