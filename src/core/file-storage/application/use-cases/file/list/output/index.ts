import type { PaginationResult } from "@/shared/pagination";

import type { File } from "../../../../../domain/entities";

export interface ListFilesOutput {
    files: File[];
    meta: PaginationResult;
}
