import { ApiProperty } from "@nestjs/swagger";

export class SuspendUserRequestDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "ID of the user performing the suspension.",
    })
    actorUserId!: string;
}

export class SuspendUserParamsDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id!: string;
}
