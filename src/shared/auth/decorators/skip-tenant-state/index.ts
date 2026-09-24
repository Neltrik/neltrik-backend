import { SetMetadata } from "@nestjs/common";

export const SKIP_TENANT_STATE_KEY = "skip_tenant_state";
export const SkipTenantState = () => SetMetadata(SKIP_TENANT_STATE_KEY, true);
