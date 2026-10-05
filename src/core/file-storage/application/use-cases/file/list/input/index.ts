import { type PaginationInput } from "@/shared/pagination";

import type { FilePurpose, FileStatus } from "../../../../../domain/types";

export interface ListFilesInput extends PaginationInput {
    tenantId?: string | undefined;
    ownerId?: string | undefined;
    resourceType?: string | undefined;
    resourceId?: string | undefined;
    purpose?: FilePurpose | undefined;
    status?: FileStatus | undefined;
}
