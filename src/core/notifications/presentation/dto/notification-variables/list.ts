import { ApiProperty } from "@nestjs/swagger";

import { NOTIFICATION_VARIABLES } from "../../../domain/catalogs";

export class NotificationVariablesResponseDto {
    @ApiProperty({
        example: NOTIFICATION_VARIABLES,
        description: "Variables available for each notification code.",
    })
    variables!: Record<string, readonly string[]>;
}
