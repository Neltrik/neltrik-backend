import { type PaginationInput } from "@/shared/pagination";

export interface ListNotificationTemplatesInput extends PaginationInput {
    actorTenantId: string;
}
