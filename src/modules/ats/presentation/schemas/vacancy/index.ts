import { z } from "zod";

import { EMPLOYMENT_TYPE, WORK_MODE } from "../../../domain/types";

export const createVacancySchema = z.object({
    title: z.string().trim().min(1).max(255),
    description: z.string().trim().min(1),
    companyId: z.uuid(),
    recruiterId: z.uuid(),
    employmentType: z.enum(EMPLOYMENT_TYPE),
    workMode: z.enum(WORK_MODE),
    closingDate: z.iso.datetime(),
    salary: z.number().min(0).nullable(),
    location: z.string().trim().max(255).nullable(),
});
