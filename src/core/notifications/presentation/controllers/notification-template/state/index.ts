import { Controller, Param, Patch } from "@nestjs/common";
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
    DesactivateNotificationTemplateUseCase,
} from "../../../../application/use-cases";
import { ActivateNotificationTemplateResponseDto, DesactivateNotificationTemplateResponseDto } from "../../../dto";
import { NOTIFICATION_TEMPLATE_MESSAGES } from "../../../messages";
import {
    activateNotificationTemplateParamsSchema,
    desactivateNotificationTemplateParamsSchema,
} from "../../../schemas";

@ApiTags("Notifications - Templates")
@Controller("notifications/templates")
export class TemplateStateController {
    constructor(
        private readonly activateNotificationTemplateUseCase: ActivateNotificationTemplateUseCase,
        private readonly desactivateNotificationTemplateUseCase: DesactivateNotificationTemplateUseCase,
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
    @Patch(":id/activate")
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
        summary: "Desactivate notification template",
        description: "Desactivates an active notification template.",
    })
    @ApiContract(DesactivateNotificationTemplateResponseDto)
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
        message: NOTIFICATION_TEMPLATE_MESSAGES.DESACTIVATED,
    })
    @Permissions("ADMIN_NOTIFICATION_TEMPLATE_UPDATE")
    @Patch(":id/desactivate")
    public async desactivate(
        @CurrentUser("tenantId") tenantId: string,
        @Param(new ZodValidationPipe(desactivateNotificationTemplateParamsSchema))
        params: { id: string },
    ): Promise<DesactivateNotificationTemplateResponseDto> {
        const id = await this.desactivateNotificationTemplateUseCase.execute({
            actorTenantId: tenantId,
            id: params.id,
        });
        return { id };
    }
}
