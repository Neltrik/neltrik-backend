import type { PaginationResult } from "@/shared/pagination";

import type { NotificationTemplate } from "../../../../../domain/entities";

export type ListNotificationTemplatesOutput = {
    templates: NotificationTemplate[];
    meta: PaginationResult;
};
