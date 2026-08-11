import { ApiProperty } from "@nestjs/swagger";

import { ROLE_SCOPE, type RoleScope } from "../../../domain/types";

export class CreateRoleRequestDto {
    @ApiProperty({
        example: "TENANT_ADMIN",
    })
    code!: string;

    @ApiProperty({
        example: "Tenant Administrator",
    })
    defaultDisplayName!: string;

    @ApiProperty({
        example: "Tenant administrator role.",
    })
    description!: string;

    @ApiProperty({
        enum: ROLE_SCOPE,
        example: ROLE_SCOPE.TENANT,
        description: "Defines the scope in which the role can be enabled.",
    })
    scope!: RoleScope;
}

export class CreateRoleResultDto {
    @ApiProperty()
    id!: string;
}
