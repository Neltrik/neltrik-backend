import type { PaginationInput } from "@/shared/pagination";

export interface ListNotificationsInput extends PaginationInput {
    actorTenantId: string;
    actorUserId: string;
}
