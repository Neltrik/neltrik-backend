import type { TenantType } from "../../../../../domain/types";

export interface CreateTenantInput {
    name: string;
    type: TenantType;
}
