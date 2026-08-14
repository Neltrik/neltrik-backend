import { ApiProperty } from "@nestjs/swagger";

import { ROLE_SCOPE, type RoleScope } from "../../../domain/types";
import { PermissionResultDto } from "../permission";

export class GetRoleResultDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    code!: string;

    @ApiProperty()
    defaultDisplayName!: string;

    @ApiProperty()
    description!: string;

    @ApiProperty({
        enum: ROLE_SCOPE,
        example: ROLE_SCOPE.TENANT,
        description: "Defines the scope in which the role can be enabled.",
    })
    scope!: RoleScope;

    @ApiProperty({
        type: [PermissionResultDto],
        isArray: true,
        description: "Permissions assigned to the role.",
    })
    permissions!: PermissionResultDto[];
}

export class GetRoleParamsDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}
