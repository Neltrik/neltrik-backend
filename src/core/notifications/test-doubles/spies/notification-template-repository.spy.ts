import type { PaginationInput } from "@/shared/pagination";

import type { NotificationTemplate } from "../../domain/entities";
import { NotificationTemplateRepository } from "../../domain/interfaces";
import type { FindTemplatesByTenantParams, NotificationChannel } from "../../domain/types";

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
