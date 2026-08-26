import type { z } from "zod";

export function xor<T extends z.ZodRawShape>(schema: z.ZodObject<T>): z.ZodObject<T> {
    return schema.superRefine((data, ctx) => {
        const keys = Object.keys(schema.shape);
        const presentKeys = keys.filter((key) => {
            const value = data[key as keyof typeof data];
            return value !== undefined && value !== null && value !== "";
        });
        if (keys.length === 0) {
            return;
        }
        if (presentKeys.length === 0) {
            ctx.addIssue({
                code: "custom",
                message: `Exactly one of ${keys.join(", ")} must be provided`,
                path: [keys[0]!],
            });
        }
        if (presentKeys.length > 1) {
            ctx.addIssue({
                code: "custom",
                message: `Only one of ${keys.join(", ")} can be provided, not both`,
                path: [keys[0]!],
            });
        }
    });
}
