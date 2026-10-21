import type { PaginationInput } from "@/shared/pagination";

import type { Notification } from "../../domain/entities";
import type { NotificationTemplate } from "../../domain/entities";
import { NotificationRepository } from "../../domain/interfaces";
import { NotificationTemplateRepository } from "../../domain/interfaces";
import type {
    FindInAppByTenantAndRecipientParams,
    FindTemplatesByTenantParams,
    NotificationChannel,
} from "../../domain/types";

export class NotificationTemplateRepositorySpy extends NotificationTemplateRepository {
    public create = jest.fn<Promise<void>, [NotificationTemplate]>();
    public findById = jest.fn<Promise<NotificationTemplate | null>, [string]>();
    public findActiveByCombination = jest.fn<
        Promise<NotificationTemplate | null>,
        [string, NotificationChannel, string, string | null]
    >();
    public findActiveByCombinationCandidates = jest.fn<
        Promise<NotificationTemplate[]>,
        [string, NotificationChannel, string, string | null, string?]
    >();
    public update = jest.fn<Promise<void>, [NotificationTemplate]>();
    public findByTenantIncludingGlobal = jest.fn<Promise<NotificationTemplate[]>, [FindTemplatesByTenantParams]>();
    public findAll = jest.fn<Promise<NotificationTemplate[]>, [PaginationInput]>();
}

export class NotificationRepositorySpy extends NotificationRepository {
    public create = jest.fn<Promise<void>, [Notification]>();
    public findById = jest.fn<Promise<Notification | null>, [string]>();
    public findInAppByTenantAndRecipient = jest.fn<Promise<Notification[]>, [FindInAppByTenantAndRecipientParams]>();
    public markAllInAppAsRead = jest.fn<Promise<number>, [string, string]>();
    public update = jest.fn<Promise<void>, [Notification]>();
}
