import { UnsupportedEmailProviderError } from "../../../domain/errors";
import type { NodemailerEmailSender } from "../../providers/email";
import { EMAIL_PROVIDER, type EmailProvider, EmailSenderFactory } from "./";

describe("EmailSenderFactory", () => {
    const nodemailerEmailSender = {} as NodemailerEmailSender;
    let factory: EmailSenderFactory;

    beforeEach(() => {
        factory = new EmailSenderFactory(nodemailerEmailSender);
    });

    it("returns the Nodemailer adapter when provider is NODEMAILER", () => {
        const result = factory.create(EMAIL_PROVIDER.NODEMAILER);
        expect(result).toBe(nodemailerEmailSender);
    });

    it("throws UnsupportedEmailProviderError when provider is unknown", () => {
        expect(() => factory.create("UNKNOWN")).toThrow(UnsupportedEmailProviderError);
    });

    it("throws UnsupportedEmailProviderError when provider is an empty string", () => {
        expect(() => factory.create("")).toThrow(UnsupportedEmailProviderError);
    });

    it("exports EMAIL_PROVIDER with the expected values", () => {
        expect(EMAIL_PROVIDER.NODEMAILER).toBe("NODEMAILER");
    });

    it("allows EmailProvider to be used as a type", () => {
        const provider: EmailProvider = EMAIL_PROVIDER.NODEMAILER;
        expect(factory.create(provider)).toBe(nodemailerEmailSender);
    });
});
