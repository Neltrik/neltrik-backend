import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsUUID } from "class-validator";

export class AssignPermissionsToRoleRequestDto {
    @ApiProperty({
        type: [String],
        example: ["550e8400-e29b-41d4-a716-446655440000", "6ba7b810-9dad-11d1-80b4-00c04fd430c8"],
    })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(100)
    @IsUUID("4", { each: true })
    permissionIds!: string[];
}

export class AssignPermissionsToRoleResultDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}

export class AssignPermissionsToRoleParamsDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}
