import { Controller, Get } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { Permissions } from "@/shared/authorization";
import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";

import { NOTIFICATION_VARIABLES } from "../../../domain/catalogs";
import { NotificationVariablesResponseDto } from "../../dto";
import { NOTIFICATION_VARIABLES_MESSAGES } from "../../messages";

@ApiTags("Notifications - Variables")
@Controller("notifications/variables")
export class NotificationVariablesController {
    @ApiOperation({
        summary: "List notification variables",
        description: "Lists the variables available for each notification code.",
    })
    @ApiContract(NotificationVariablesResponseDto)
    @ApiOkResponse({ description: "Resource found." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "Not found." })
    @ApiConflictResponse({ description: "Conflict." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({
        code: RESPONSE_CODES.RESOURCE_FOUND,
        message: NOTIFICATION_VARIABLES_MESSAGES.LISTED,
    })
    @Permissions("NOTIFICATION_TEMPLATE_READ")
    @Get()
    public list(): NotificationVariablesResponseDto {
        return { variables: NOTIFICATION_VARIABLES };
    }
}
