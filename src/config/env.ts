import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().positive(),
    FRONTEND_URL: z.url(),
    MAGIC_LINK_BASE_URL: z.url(),
});

export const env = Object.freeze(envSchema.parse(process.env));
export type Env = typeof env;
