import { z } from "zod";

export const validateEmailVerificationQuerySchema = z.object({
    token: z.string().min(1, "Token is required"),
});
