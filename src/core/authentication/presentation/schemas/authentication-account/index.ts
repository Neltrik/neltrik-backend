import { z } from "zod";

import { xor } from "@/shared/zod";

export const registerAccountSchema = z.object({
    invitationToken: z.string().min(1, "Invitation token is required"),
    provider: z.string().min(1, "Provider is required"),
    email: z.email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
});

export const getAccountQuerySchema = xor(
    z.object({
        userId: z.uuid("Invalid userId format").optional(),
        email: z.email("Invalid email format").optional(),
    }),
);
