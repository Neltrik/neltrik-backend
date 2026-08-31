import { ApiProperty } from "@nestjs/swagger";

export class UserHasPermissionQueryDto {
    @ApiProperty({
        example: "TENANT_LIST",
        description: "Código del permiso a verificar.",
    })
    code!: string;
}

export class UserHasPermissionResponseDto {
    @ApiProperty({
        example: true,
        description: "Indica si el usuario tiene el permiso.",
    })
    hasPermission!: boolean;
}
