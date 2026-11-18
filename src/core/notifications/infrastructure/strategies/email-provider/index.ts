import { Injectable } from "@nestjs/common";

import { UnsupportedEmailProviderError } from "../../../domain/errors";
import { EmailSender, NodemailerEmailSender } from "../../providers/email";
import { EMAIL_PROVIDER, EmailProvider } from "./types";

@Injectable()
export class EmailSenderFactory {
    constructor(private readonly nodemailerEmailSender: NodemailerEmailSender) {}

    public create(provider: string): EmailSender {
        switch (provider) {
            case EMAIL_PROVIDER.NODEMAILER:
                return this.nodemailerEmailSender;
            default:
                throw new UnsupportedEmailProviderError();
        }
    }
}

export { EMAIL_PROVIDER, type EmailProvider };
