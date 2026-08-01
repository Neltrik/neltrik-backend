import { z } from "zod";

export const registerUserSchema = z.object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.email(),
    tenantId: z.uuid(),
    roleId: z.uuid(),
});
