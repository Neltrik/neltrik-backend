import type { PaginationResult } from "@/shared/pagination";

import type { NotificationPreference } from "../../../../../domain/entities";

export type ListNotificationPreferencesOutput = {
    preferences: NotificationPreference[];
    meta: PaginationResult;
};
