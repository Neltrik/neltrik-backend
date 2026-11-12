import { z } from "zod";

import { paginationQuerySchema } from "@/shared/pagination";

export const createCompanySchema = z.object({
    name: z.string().min(1, "Name is required").max(255, "Name must be at most 255 characters"),
    slug: z
        .string()
        .min(3, "Slug must be at least 3 characters")
        .max(50, "Slug must be at most 50 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and hyphen-separated"),
});

export const companyIdParamsSchema = z.object({
    id: z.uuid(),
});

export const listCompaniesQuerySchema = paginationQuerySchema;

export const updateCompanySchema = z.object({
    name: z.string().min(1, "Name is required").max(255, "Name must be at most 255 characters").optional(),
    slug: z
        .string()
        .min(3, "Slug must be at least 3 characters")
        .max(50, "Slug must be at most 50 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and hyphen-separated")
        .optional(),
});
