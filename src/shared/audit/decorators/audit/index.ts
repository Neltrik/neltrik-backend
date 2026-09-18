import { SetMetadata } from "@nestjs/common";

import type { AuditMetadata } from "../../types";

export const AUDIT_METADATA_KEY = "audit_metadata";

export const Audit = (metadata: AuditMetadata) => SetMetadata(AUDIT_METADATA_KEY, metadata);
