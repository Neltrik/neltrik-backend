import { ApiProperty } from "@nestjs/swagger";

import { PERMISSION_SCOPE, type PermissionScope } from "../../../domain/types";

export class PermissionResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;

    @ApiProperty({
        example: "USER_CREATE",
    })
    code!: string;

    @ApiProperty({
        example: "Allows creating users.",
    })
    description!: string;

    @ApiProperty({
        enum: PERMISSION_SCOPE,
        example: PERMISSION_SCOPE.TENANT,
    })
    scope!: PermissionScope;
}

export class GetPermissionsByRoleResultDto {
    @ApiProperty({
        type: [PermissionResultDto],
    })
    permissions!: PermissionResultDto[];
}

export class GetPermissionsByRoleParamsDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}
