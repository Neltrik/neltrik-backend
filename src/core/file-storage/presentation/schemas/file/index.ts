import { z } from "zod";

import { FILE_PURPOSE, FILE_STATUS } from "../../../domain/types";

export const getFileParamsSchema = z.object({
    fileId: z.uuid(),
});

export const getDownloadUrlParamsSchema = z.object({
    fileId: z.uuid(),
});

export const deleteFileParamsSchema = z.object({
    fileId: z.uuid(),
});

export const uploadFileBodySchema = z.object({
    purpose: z.enum([FILE_PURPOSE.CV, FILE_PURPOSE.AVATAR, FILE_PURPOSE.DOCUMENT]),
    resourceType: z.string().min(1).max(50),
    resourceId: z.uuid(),
});

export const replaceFileParamsSchema = z.object({
    fileId: z.uuid(),
});

export const listFilesQuerySchema = z.object({
    cursor: z.uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    ownerId: z.uuid().optional(),
    resourceType: z.string().min(1).max(50).optional(),
    resourceId: z.uuid().optional(),
    purpose: z.enum([FILE_PURPOSE.CV, FILE_PURPOSE.AVATAR, FILE_PURPOSE.DOCUMENT]).optional(),
    status: z.enum([FILE_STATUS.PENDING, FILE_STATUS.READY, FILE_STATUS.INFECTED, FILE_STATUS.DELETED]).optional(),
});
