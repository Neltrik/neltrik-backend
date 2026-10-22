import { z } from "zod";

import { paginationQuerySchema } from "@/shared/pagination";

export const listNotificationsQuerySchema = paginationQuerySchema;

export const markNotificationAsReadParamsSchema = z.object({
    id: z.uuid(),
});
