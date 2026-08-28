import { z } from "zod";

export const loginSchema = z.object({
    email: z.email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
    ipAddress: z.ipv4("Invalid IP address format").optional(),
    userAgent: z.string().min(1, "User agent is required").optional(),
});

export const logoutSchema = z.object({
    refreshToken: z.uuid("Invalid refresh token format"),
});

export const revokeSessionParamsSchema = z.object({
    id: z.uuid("Invalid session ID format"),
});

export const revokeSessionBodySchema = z.object({
    userId: z.uuid("Invalid user ID format"),
});
