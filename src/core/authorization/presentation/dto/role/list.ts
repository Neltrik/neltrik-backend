import { ApiProperty } from "@nestjs/swagger";

import { ROLE_SCOPE, type RoleScope } from "../../../domain/types";

export class RoleResultDto {
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
}
