import type { TenantType } from "../../../../../domain/types";

export interface CreateTenantInput {
    name: string;
    type: TenantType;
    ownerFirstName: string;
    ownerLastName: string;
    ownerEmail: string;
    ownerRoleId: string;
}
