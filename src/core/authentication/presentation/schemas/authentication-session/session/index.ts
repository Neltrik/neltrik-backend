import { z } from "zod";

export const revokeSessionParamsSchema = z.object({
    id: z.uuid("Invalid session ID format"),
});
