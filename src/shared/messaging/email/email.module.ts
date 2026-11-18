import { Module } from "@nestjs/common";

import { NodemailerEmailSender } from "./";
import { EmailSenderFactory } from "./factory";

@Module({
    providers: [NodemailerEmailSender, EmailSenderFactory],
    exports: [NodemailerEmailSender, EmailSenderFactory],
})
export class EmailModule {}
