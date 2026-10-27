import type { PaginationInput } from "@/shared/pagination";

export interface ListNotificationPreferencesInput extends PaginationInput {
    actorUserId: string;
}
