import type { PaginationResult } from "@/shared/pagination";

import type { Notification } from "../../../../../domain/entities";

export type ListNotificationsOutput = {
    notifications: Notification[];
    meta: PaginationResult;
};
