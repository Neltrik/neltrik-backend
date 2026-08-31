import { ApiProperty } from "@nestjs/swagger";

import { PERMISSION_SCOPE, type PermissionScope } from "../../../domain/types";

export class GetUserEffectivePermissionsResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "ID del permiso.",
    })
    id!: string;

    @ApiProperty({
        example: "read:users",
        description: "Código único del permiso.",
    })
    code!: string;

    @ApiProperty({
        example: "Can read users",
        description: "Descripción del permiso.",
    })
    description!: string;

    @ApiProperty({
        enum: PERMISSION_SCOPE,
        example: PERMISSION_SCOPE.TENANT,
        description: "Ámbito del permiso.",
    })
    scope!: PermissionScope;
}
