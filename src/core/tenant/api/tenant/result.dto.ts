import { type ResourceStatus } from "@/types/index";

import { type TenantType } from "../../domain/types";

export class TenantResultDto {
    id!: string;
    name!: string;
    slug!: string;
    type!: TenantType;
    status!: ResourceStatus;
    createdAt!: Date;
    updatedAt!: Date;
    suspendedAt!: Date | null;
}
