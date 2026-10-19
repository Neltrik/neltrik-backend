import { Controller, Param, Post } from "@nestjs/common";
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

import { CurrentUser } from "@/shared/auth";
import { Permissions } from "@/shared/authorization";
import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/zod";

import {
    ActivateNotificationTemplateUseCase,
    DeactivateNotificationTemplateUseCase,
} from "../../../application/use-cases";
import { ActivateNotificationTemplateResponseDto, DeactivateNotificationTemplateResponseDto } from "../../dto";
import { NOTIFICATION_TEMPLATE_MESSAGES } from "../../messages";
import { activateNotificationTemplateParamsSchema, deactivateNotificationTemplateParamsSchema } from "../../schemas";

@ApiTags("Notifications - Templates")
@Controller("notifications/templates")
export class TemplateStateController {
    constructor(
        private readonly activateNotificationTemplateUseCase: ActivateNotificationTemplateUseCase,
        private readonly deactivateNotificationTemplateUseCase: DeactivateNotificationTemplateUseCase,
    ) {}

    @ApiOperation({
        summary: "Activate notification template",
        description: "Activates an inactive notification template.",
    })
    @ApiContract(ActivateNotificationTemplateResponseDto)
    @ApiOkResponse({
        description: "Resource updated.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiUnauthorizedResponse({
        description: "Unauthorized.",
    })
    @ApiForbiddenResponse({
        description: "Forbidden.",
    })
    @ApiNotFoundResponse({
        description: "Notification template not found.",
    })
    @ApiConflictResponse({
        description: "An active notification template already exists for this combination.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: NOTIFICATION_TEMPLATE_MESSAGES.ACTIVATED,
    })
    @Permissions("ADMIN_NOTIFICATION_TEMPLATE_UPDATE")
    @Post(":id/activate")
    public async activate(
        @CurrentUser("tenantId") tenantId: string,
        @Param(new ZodValidationPipe(activateNotificationTemplateParamsSchema))
        params: { id: string },
    ): Promise<ActivateNotificationTemplateResponseDto> {
        const id = await this.activateNotificationTemplateUseCase.execute({
            actorTenantId: tenantId,
            id: params.id,
        });
        return { id };
    }

    @ApiOperation({
        summary: "Deactivate notification template",
        description: "Deactivates an active notification template.",
    })
    @ApiContract(DeactivateNotificationTemplateResponseDto)
    @ApiOkResponse({
        description: "Resource updated.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiUnauthorizedResponse({
        description: "Unauthorized.",
    })
    @ApiForbiddenResponse({
        description: "Forbidden.",
    })
    @ApiNotFoundResponse({
        description: "Notification template not found.",
    })
    @ApiConflictResponse({
        description: "Conflict.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: NOTIFICATION_TEMPLATE_MESSAGES.DEACTIVATED,
    })
    @Permissions("ADMIN_NOTIFICATION_TEMPLATE_UPDATE")
    @Post(":id/deactivate")
    public async deactivate(
        @CurrentUser("tenantId") tenantId: string,
        @Param(new ZodValidationPipe(deactivateNotificationTemplateParamsSchema))
        params: { id: string },
    ): Promise<DeactivateNotificationTemplateResponseDto> {
        const id = await this.deactivateNotificationTemplateUseCase.execute({
            actorTenantId: tenantId,
            id: params.id,
        });
        return { id };
    }
}
