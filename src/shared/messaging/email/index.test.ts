import * as nodemailer from "nodemailer";

import { env } from "@/config/env";

import { type EmailMessage, EmailSender, NodemailerEmailSender } from "./index";

jest.mock("nodemailer", () => ({
    createTransport: jest.fn(),
}));

describe("NodemailerEmailSender", () => {
    const sendMailMock = jest.fn<Promise<nodemailer.SentMessageInfo>, [nodemailer.SendMailOptions]>();

    beforeEach(() => {
        jest.clearAllMocks();
        sendMailMock.mockReset();
        sendMailMock.mockResolvedValue({ messageId: "test-message-id" });
        (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: sendMailMock });
    });

    const makeSut = () => {
        const sut = new NodemailerEmailSender();
        return { sut };
    };

    const createMessage = (): EmailMessage => ({
        to: "user@example.com",
        subject: "Test email",
        body: "This is a test email",
        html: "<p>This is a test email</p>",
    });

    describe("constructor", () => {
        it("should create a transporter with SMTP configuration", () => {
            makeSut();
            expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
            expect(nodemailer.createTransport).toHaveBeenCalledWith({
                host: env.SMTP_HOST,
                port: env.SMTP_PORT,
                secure: env.SMTP_SECURE,
                auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
            });
        });
    });

    describe("send", () => {
        it("should send an email with the provided message", async () => {
            const { sut } = makeSut();
            const message = createMessage();
            await sut.send(message);
            expect(sendMailMock).toHaveBeenCalledTimes(1);
            expect(sendMailMock).toHaveBeenCalledWith({
                from: env.SMTP_FROM,
                to: message.to,
                subject: message.subject,
                text: message.body,
                html: message.html,
            });
        });

        it("should use the configured sender address", async () => {
            const { sut } = makeSut();
            await sut.send(createMessage());
            expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ from: env.SMTP_FROM }));
        });

        it("should include both text and html versions", async () => {
            const { sut } = makeSut();
            const message = createMessage();
            await sut.send(message);
            const mailOptions = sendMailMock.mock.calls[0]?.[0];
            expect(mailOptions?.text).toBe(message.body);
            expect(mailOptions?.html).toBe(message.html);
        });

        it("should propagate an error when sending the email fails", async () => {
            const { sut } = makeSut();
            const error = new Error("Failed to send email");
            sendMailMock.mockRejectedValueOnce(error);
            await expect(sut.send(createMessage())).rejects.toThrow(error);
            expect(sendMailMock).toHaveBeenCalledTimes(1);
        });

        it("should send multiple emails independently", async () => {
            const { sut } = makeSut();
            const firstMessage = createMessage();
            const secondMessage: EmailMessage = {
                to: "another@example.com",
                subject: "Another email",
                body: "Another message",
                html: "<p>Another message</p>",
            };
            await sut.send(firstMessage);
            await sut.send(secondMessage);
            expect(sendMailMock).toHaveBeenCalledTimes(2);
            expect(sendMailMock).toHaveBeenNthCalledWith(1, {
                from: env.SMTP_FROM,
                to: firstMessage.to,
                subject: firstMessage.subject,
                text: firstMessage.body,
                html: firstMessage.html,
            });
            expect(sendMailMock).toHaveBeenNthCalledWith(2, {
                from: env.SMTP_FROM,
                to: secondMessage.to,
                subject: secondMessage.subject,
                text: secondMessage.body,
                html: secondMessage.html,
            });
        });

        it("should send plain text version generated from html", async () => {
            const { sut } = makeSut();
            const message = {
                to: "user@example.com",
                subject: "Test email",
                body: "<h1>Hello</h1><p>This is a test</p>",
                html: "<h1>Hello</h1><p>This is a test</p>",
            };
            await sut.send(message);
            const mailOptions = sendMailMock.mock.calls[0]?.[0];
            expect(mailOptions?.text).not.toContain("<h1>");
            expect(mailOptions?.text).not.toContain("</h1>");
            expect(mailOptions?.text).toContain("HELLO");
            expect(mailOptions?.text).toContain("This is a test");
        });

        it("should keep html version as HTML", async () => {
            const { sut } = makeSut();
            const message = {
                to: "user@example.com",
                subject: "Test email",
                body: "<h1>Hello</h1>",
                html: "<h1>Hello</h1>",
            };
            await sut.send(message);
            const mailOptions = sendMailMock.mock.calls[0]?.[0];
            expect(mailOptions?.html).toBe("<h1>Hello</h1>");
            const { html: _html, ...props } = message;
            await sut.send(props);
        });
    });

    describe("exports", () => {
        it("should export EmailSender as a class", () => {
            expect(EmailSender).toBeDefined();
            expect(typeof EmailSender).toBe("function");
        });

        it("should extend EmailSender", () => {
            const { sut } = makeSut();
            expect(sut).toBeInstanceOf(EmailSender);
        });

        it("should allow EmailMessage to be used as a type", () => {
            const message: EmailMessage = createMessage();
            expect(message.to).toBe("user@example.com");
            expect(message.subject).toBe("Test email");
        });
    });
});
