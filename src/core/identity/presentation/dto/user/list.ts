import { ApiProperty } from "@nestjs/swagger";

import { RESOURCE_STATUS, type ResourceStatus } from "@/types/index";

class GetUsersRoleResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440001",
    })
    id!: string;

    @ApiProperty({
        example: "RECRUITER",
    })
    code!: string;

    @ApiProperty({
        example: "TENANT",
    })
    scope!: string;
}

export class GetUsersResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;

    @ApiProperty({
        example: "John",
    })
    firstName!: string;

    @ApiProperty({
        example: "Doe",
    })
    lastName!: string;

    @ApiProperty({
        example: "john@company.com",
    })
    email!: string;

    @ApiProperty({
        type: GetUsersRoleResultDto,
    })
    role!: GetUsersRoleResultDto;

    @ApiProperty({
        enum: RESOURCE_STATUS,
        example: RESOURCE_STATUS.ACTIVE,
    })
    status!: ResourceStatus;
}
