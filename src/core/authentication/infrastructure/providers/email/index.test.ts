import * as nodemailer from "nodemailer";

import { NodemailerEmailSender } from "./index";

jest.mock("nodemailer", () => ({
    createTransport: jest.fn(),
}));

describe("NodemailerEmailSender", () => {
    const sendMailMock = jest.fn<Promise<nodemailer.SentMessageInfo>, [nodemailer.SendMailOptions]>();

    beforeEach(() => {
        jest.clearAllMocks();
        (nodemailer.createTransport as jest.Mock).mockReturnValue({
            sendMail: sendMailMock,
        });
        sendMailMock.mockResolvedValue({ messageId: "test-message-id" });
    });

    const makeSut = () => {
        const sut = new NodemailerEmailSender();
        return { sut };
    };

    describe("sendVerificationEmail", () => {
        it("should send a verification email", async () => {
            const { sut } = makeSut();
            await sut.sendVerificationEmail("user@example.com", "verification-token");
            expect(sendMailMock).toHaveBeenCalledTimes(1);
            expect(sendMailMock).toHaveBeenCalledWith(
                expect.objectContaining({ to: "user@example.com", subject: "Verify your email address" }),
            );
        });

        it("should include the verification link in html and text", async () => {
            const { sut } = makeSut();
            await sut.sendVerificationEmail("user@example.com", "verification-token");
            const mailOptions = sendMailMock.mock.calls[0]?.[0];
            expect(mailOptions?.html).toContain("/auth/verify-email?token=verification-token");
            expect(mailOptions?.text).toContain("/auth/verify-email?token=verification-token");
        });

        it("should include both html and text versions", async () => {
            const { sut } = makeSut();
            await sut.sendVerificationEmail("user@example.com", "verification-token");
            const mailOptions = sendMailMock.mock.calls[0]?.[0];
            expect(typeof mailOptions?.html).toBe("string");
            expect(typeof mailOptions?.text).toBe("string");
        });

        it("should propagate an error when sending the email fails", async () => {
            const { sut } = makeSut();
            const error = new Error("Failed to send email");
            sendMailMock.mockRejectedValueOnce(error);
            await expect(sut.sendVerificationEmail("user@example.com", "verification-token")).rejects.toThrow(error);
        });
    });

    describe("sendPasswordResetEmail", () => {
        it("should send a password reset email", async () => {
            const { sut } = makeSut();
            await sut.sendPasswordResetEmail("user@example.com", "reset-token");
            expect(sendMailMock).toHaveBeenCalledTimes(1);
            expect(sendMailMock).toHaveBeenCalledWith(
                expect.objectContaining({ to: "user@example.com", subject: "Reset your password" }),
            );
        });

        it("should include the password reset link in html and text", async () => {
            const { sut } = makeSut();
            await sut.sendPasswordResetEmail("user@example.com", "reset-token");
            const mailOptions = sendMailMock.mock.calls[0]?.[0];
            expect(mailOptions?.html).toContain("/auth/reset-password?token=reset-token");
            expect(mailOptions?.text).toContain("/auth/reset-password?token=reset-token");
        });

        it("should include both html and text versions", async () => {
            const { sut } = makeSut();
            await sut.sendPasswordResetEmail("user@example.com", "reset-token");
            const mailOptions = sendMailMock.mock.calls[0]?.[0];
            expect(typeof mailOptions?.html).toBe("string");
            expect(typeof mailOptions?.text).toBe("string");
        });

        it("should propagate an error when sending the email fails", async () => {
            const { sut } = makeSut();
            const error = new Error("Failed to send email");
            sendMailMock.mockRejectedValueOnce(error);
            await expect(sut.sendPasswordResetEmail("user@example.com", "reset-token")).rejects.toThrow(error);
        });
    });
});
