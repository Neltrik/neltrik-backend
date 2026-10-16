import { Module } from "@nestjs/common";

import { NotificationRepository } from "./domain/interfaces";
import { PrismaNotificationRepository } from "./infrastructure/repositories";

@Module({
    providers: [
        {
            provide: NotificationRepository,
            useClass: PrismaNotificationRepository,
        },
    ],
})
export class NotificationsModule {}
