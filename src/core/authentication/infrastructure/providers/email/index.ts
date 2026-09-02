import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

import { env } from "@/config/env";

import { EmailSender } from "./contracts";

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

    public async sendVerificationEmail(to: string, token: string): Promise<void> {
        const verificationLink = `${env.FRONTEND_URL}/auth/verify-email?token=${token}`;
        await this.transporter.sendMail({
            from: env.SMTP_FROM,
            to,
            subject: "Verify your email address",
            html: `
                <h1>Verify your email</h1>
                <p>Click the link below to verify your email address:</p>
                <a href="${verificationLink}">${verificationLink}</a>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
            text: `
                Verify your email
                Click the link below to verify your email address:
                ${verificationLink}
                This link will expire in 24 hours.
                If you didn't request this, please ignore this email.
            `,
        });
    }
}
