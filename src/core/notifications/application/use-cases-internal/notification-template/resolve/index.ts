import { Injectable } from "@nestjs/common";

import { NotificationTemplate } from "../../../../domain/entities";
import { NotificationTemplateNotFoundError } from "../../../../domain/errors";
import { NotificationTemplateRepository } from "../../../../domain/interfaces";
import { ResolveNotificationTemplateInput } from "./input";

@Injectable()
export class ResolveNotificationTemplateInternalUseCase {
    constructor(private readonly notificationTemplateRepository: NotificationTemplateRepository) {}

    public async execute(input: ResolveNotificationTemplateInput): Promise<NotificationTemplate> {
        const template = await this.notificationTemplateRepository.findActiveByCombination(
            input.code,
            input.channel,
            input.locale,
            input.tenantId,
        );
        if (!template) {
            throw new NotificationTemplateNotFoundError();
        }
        return template;
    }
}
