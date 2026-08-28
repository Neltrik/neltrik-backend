import { z } from "zod";

import "dotenv/config";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().positive(),
    FRONTEND_URL: z.url(),
    MAGIC_LINK_BASE_URL: z.url(),
    JWT_REFRESH_TOKEN_EXPIRES_IN: z.coerce.number().int().positive().default(604800),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
});

export const env = Object.freeze(envSchema.parse(process.env));
export type Env = typeof env;
