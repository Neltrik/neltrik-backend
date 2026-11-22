import { ApiProperty } from "@nestjs/swagger";

import { PaginationQueryDto } from "@/shared/pagination";

import { MEMBERSHIP_STATUSES, type MembershipStatus } from "../../../domain/types/membership";

export class ListMyMembershipsQueryDto extends PaginationQueryDto {
    @ApiProperty({
        example: "ACTIVE",
        description: "Filter by membership status.",
        required: false,
        enum: MEMBERSHIP_STATUSES,
    })
    status?: MembershipStatus;
}
