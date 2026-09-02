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
        });

        it("should send the email to the provided address", async () => {
            const { sut } = makeSut();
            await sut.sendVerificationEmail("user@example.com", "verification-token");
            expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ to: "user@example.com" }));
        });

        it("should include the verification token in the verification link", async () => {
            const { sut } = makeSut();
            await sut.sendVerificationEmail("user@example.com", "verification-token");
            const mailOptions = sendMailMock.mock.calls[0]?.[0];
            expect(mailOptions).toBeDefined();
            expect(mailOptions?.html).toContain("verification-token");
            expect(mailOptions?.text).toContain("verification-token");
        });

        it("should include the verification link in the email", async () => {
            const { sut } = makeSut();
            await sut.sendVerificationEmail("user@example.com", "verification-token");
            const mailOptions = sendMailMock.mock.calls[0]?.[0];
            expect(mailOptions).toBeDefined();
            expect(mailOptions?.html).toContain("/auth/verify-email?token=verification-token");
            expect(mailOptions?.text).toContain("/auth/verify-email?token=verification-token");
        });

        it("should use the verification email subject", async () => {
            const { sut } = makeSut();
            await sut.sendVerificationEmail("user@example.com", "verification-token");
            expect(sendMailMock).toHaveBeenCalledWith(
                expect.objectContaining({ subject: "Verify your email address" }),
            );
        });

        it("should include both html and text versions", async () => {
            const { sut } = makeSut();
            await sut.sendVerificationEmail("user@example.com", "verification-token");
            const mailOptions = sendMailMock.mock.calls[0]?.[0];
            expect(mailOptions).toBeDefined();
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
});
