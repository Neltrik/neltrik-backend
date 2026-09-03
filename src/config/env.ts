import { z } from "zod";

import "dotenv/config";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().positive(),
    FRONTEND_URL: z.url(),
    MAGIC_LINK_BASE_URL: z.url(),
    JWT_REFRESH_TOKEN_EXPIRES_IN: z.coerce.number().int().positive().default(604800),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: z
        .string()
        .default("false")
        .transform((value) => value === "true"),
    SMTP_USER: z.email("SMTP_USER must be a valid email"),
    SMTP_PASSWORD: z.string().min(1, "SMTP_PASSWORD is required"),
    SMTP_FROM: z.string().min(1, "SMTP_FROM is required"),
});

export const env = Object.freeze(envSchema.parse(process.env));
export type Env = typeof env;
