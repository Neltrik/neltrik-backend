import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
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
import { ResponsePayload } from "@/shared/pagination";
import { ZodValidationPipe } from "@/shared/zod";

import {
    CreateNotificationTemplateUseCase,
    GetNotificationTemplateUseCase,
    ListNotificationTemplatesUseCase,
    UpdateNotificationTemplateUseCase,
} from "../../../application/use-cases";
import {
    CreateNotificationTemplateRequestDto,
    CreateNotificationTemplateResponseDto,
    ListNotificationTemplatesQueryDto,
    NotificationTemplateResponseDto,
    UpdateNotificationTemplateRequestDto,
    UpdateNotificationTemplateResponseDto,
} from "../../dto";
import { NOTIFICATION_TEMPLATE_MESSAGES } from "../../messages";
import {
    createNotificationTemplateSchema,
    getNotificationTemplateParamsSchema,
    listNotificationTemplatesQuerySchema,
    updateNotificationTemplateParamsSchema,
    updateNotificationTemplateSchema,
} from "../../schemas";

@ApiTags("Notifications - Templates")
@Controller("notifications/templates")
export class TemplateManagementController {
    constructor(
        private readonly createNotificationTemplateUseCase: CreateNotificationTemplateUseCase,
        private readonly getNotificationTemplateUseCase: GetNotificationTemplateUseCase,
        private readonly listNotificationTemplatesUseCase: ListNotificationTemplatesUseCase,
        private readonly updateNotificationTemplateUseCase: UpdateNotificationTemplateUseCase,
    ) {}

    @ApiOperation({
        summary: "Create notification template",
        description: "Creates a new notification template for a tenant or globally (PlatformAdmin only).",
    })
    @ApiContract(CreateNotificationTemplateResponseDto)
    @ApiCreatedResponse({
        description: "Resource created.",
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
        code: RESPONSE_CODES.RESOURCE_CREATED,
        message: NOTIFICATION_TEMPLATE_MESSAGES.CREATED,
    })
    @Permissions("ADMIN_NOTIFICATION_TEMPLATE_CREATE")
    @Post()
    public async create(
        @CurrentUser("tenantId") tenantId: string,
        @Body(new ZodValidationPipe(createNotificationTemplateSchema))
        body: CreateNotificationTemplateRequestDto,
    ): Promise<CreateNotificationTemplateResponseDto> {
        const id = await this.createNotificationTemplateUseCase.execute({
            actorTenantId: tenantId,
            targetTenantId: body.targetTenantId,
            code: body.code,
            channel: body.channel,
            locale: body.locale,
            subject: body.subject,
            body: body.body,
        });
        return { id };
    }

    @ApiOperation({
        summary: "Get notification template",
        description: "Gets a notification template by its identifier.",
    })
    @ApiContract(NotificationTemplateResponseDto)
    @ApiOkResponse({
        description: "Resource found.",
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
        code: RESPONSE_CODES.RESOURCE_FOUND,
        message: NOTIFICATION_TEMPLATE_MESSAGES.RETRIEVED,
    })
    @Permissions("ADMIN_NOTIFICATION_TEMPLATE_LIST")
    @Get(":id")
    public async get(
        @CurrentUser("tenantId") tenantId: string,
        @Param(new ZodValidationPipe(getNotificationTemplateParamsSchema))
        params: { id: string },
    ): Promise<NotificationTemplateResponseDto> {
        const template = await this.getNotificationTemplateUseCase.execute({
            actorTenantId: tenantId,
            id: params.id,
        });
        return {
            id: template.id,
            tenantId: template.tenantId,
            code: template.code,
            channel: template.channel,
            locale: template.locale,
            subject: template.subject,
            body: template.body,
            isActive: template.isActive(),
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
        };
    }

    @ApiOperation({
        summary: "List notification templates",
        description: "Lists notification templates with cursor pagination.",
    })
    @ApiContract(NotificationTemplateResponseDto, { responseType: "array" })
    @ApiOkResponse({
        description: "Resource found.",
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
        code: RESPONSE_CODES.RESOURCE_FOUND,
        message: NOTIFICATION_TEMPLATE_MESSAGES.LISTED,
    })
    @Permissions("ADMIN_NOTIFICATION_TEMPLATE_LIST")
    @Get()
    public async list(
        @CurrentUser("tenantId") tenantId: string,
        @Query(new ZodValidationPipe(listNotificationTemplatesQuerySchema))
        query: ListNotificationTemplatesQueryDto,
    ): Promise<ResponsePayload<NotificationTemplateResponseDto[]>> {
        const output = await this.listNotificationTemplatesUseCase.execute({
            actorTenantId: tenantId,
            cursor: query.cursor,
            limit: query.limit,
        });
        return {
            data: output.templates.map((template) => ({
                id: template.id,
                tenantId: template.tenantId,
                code: template.code,
                channel: template.channel,
                locale: template.locale,
                subject: template.subject,
                body: template.body,
                isActive: template.isActive(),
                createdAt: template.createdAt,
                updatedAt: template.updatedAt,
            })),
            meta: output.meta,
        };
    }

    @ApiOperation({
        summary: "Update notification template",
        description: "Updates the subject and body of a notification template.",
    })
    @ApiContract(UpdateNotificationTemplateResponseDto)
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
        message: NOTIFICATION_TEMPLATE_MESSAGES.UPDATED,
    })
    @Permissions("ADMIN_NOTIFICATION_TEMPLATE_UPDATE")
    @Patch(":id")
    public async update(
        @CurrentUser("tenantId") tenantId: string,
        @Param(new ZodValidationPipe(updateNotificationTemplateParamsSchema))
        params: { id: string },
        @Body(new ZodValidationPipe(updateNotificationTemplateSchema))
        body: UpdateNotificationTemplateRequestDto,
    ): Promise<UpdateNotificationTemplateResponseDto> {
        const id = await this.updateNotificationTemplateUseCase.execute({
            actorTenantId: tenantId,
            id: params.id,
            subject: body.subject,
            body: body.body,
        });
        return { id };
    }
}
