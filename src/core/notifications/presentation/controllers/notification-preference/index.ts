import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from "@nestjs/common";
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

import { CurrentUser, type UserPayload } from "@/shared/auth";
import { Permissions } from "@/shared/authorization";
import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ResponsePayload } from "@/shared/pagination";
import { ZodValidationPipe } from "@/shared/zod";

import {
    CreateNotificationPreferenceUseCase,
    DeleteNotificationPreferenceUseCase,
    GetNotificationPreferenceUseCase,
    ListNotificationPreferencesUseCase,
    UpdateNotificationPreferenceUseCase,
} from "../../../application/use-cases";
import {
    CreateNotificationPreferenceRequestDto,
    DeleteNotificationPreferenceResponseDto,
    ListNotificationPreferencesQueryDto,
    NotificationPreferenceParamsDto,
    NotificationPreferenceResponseDto,
    UpdateNotificationPreferenceRequestDto,
} from "../../dto";
import { NotificationPreferenceMapper } from "../../mappers";
import { NOTIFICATION_PREFERENCE_MESSAGES } from "../../messages";
import {
    createNotificationPreferenceSchema,
    listNotificationPreferencesQuerySchema,
    notificationPreferenceParamsSchema,
    updateNotificationPreferenceSchema,
} from "../../schemas";

@ApiTags("Notifications - Preferences")
@Controller("notifications/preferences")
export class NotificationPreferenceController {
    constructor(
        private readonly createNotificationPreferenceUseCase: CreateNotificationPreferenceUseCase,
        private readonly deleteNotificationPreferenceUseCase: DeleteNotificationPreferenceUseCase,
        private readonly getNotificationPreferenceUseCase: GetNotificationPreferenceUseCase,
        private readonly listNotificationPreferencesUseCase: ListNotificationPreferencesUseCase,
        private readonly updateNotificationPreferenceUseCase: UpdateNotificationPreferenceUseCase,
    ) {}

    @ApiOperation({
        summary: "Create notification preference",
        description: "Creates a notification preference for the authenticated user.",
    })
    @ApiContract(NotificationPreferenceResponseDto)
    @ApiCreatedResponse({ description: "Resource created." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "Not found." })
    @ApiConflictResponse({ description: "Notification preference already exists." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({
        code: RESPONSE_CODES.RESOURCE_CREATED,
        message: NOTIFICATION_PREFERENCE_MESSAGES.CREATED,
    })
    @Permissions("NOTIFICATION_PREFERENCE_MANAGE")
    @Post()
    public async create(
        @CurrentUser() user: UserPayload,
        @Body(new ZodValidationPipe(createNotificationPreferenceSchema))
        body: CreateNotificationPreferenceRequestDto,
    ): Promise<{ id: string }> {
        const id = await this.createNotificationPreferenceUseCase.execute({
            actorTenantId: user.tenantId,
            actorUserId: user.userId,
            channel: body.channel,
            category: body.category,
        });
        return { id };
    }

    @ApiOperation({
        summary: "List notification preferences",
        description: "Lists the notification preferences of the authenticated user with cursor pagination.",
    })
    @ApiContract(NotificationPreferenceResponseDto, { responseType: "array" })
    @ApiOkResponse({ description: "Resource found." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "Not found." })
    @ApiConflictResponse({ description: "Conflict." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({
        code: RESPONSE_CODES.RESOURCE_FOUND,
        message: NOTIFICATION_PREFERENCE_MESSAGES.LISTED,
    })
    @Permissions("NOTIFICATION_PREFERENCE_MANAGE")
    @Get()
    public async list(
        @CurrentUser("userId") userId: string,
        @Query(new ZodValidationPipe(listNotificationPreferencesQuerySchema))
        query: ListNotificationPreferencesQueryDto,
    ): Promise<ResponsePayload<NotificationPreferenceResponseDto[]>> {
        const output = await this.listNotificationPreferencesUseCase.execute({
            actorUserId: userId,
            cursor: query.cursor,
            limit: query.limit,
        });
        return {
            data: output.preferences.map((preference) => NotificationPreferenceMapper.toResponse(preference)),
            meta: output.meta,
        };
    }

    @ApiOperation({
        summary: "Get notification preference",
        description: "Gets a notification preference of the authenticated user by its identifier.",
    })
    @ApiContract(NotificationPreferenceResponseDto)
    @ApiOkResponse({ description: "Resource found." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "Notification preference not found." })
    @ApiConflictResponse({ description: "Conflict." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({
        code: RESPONSE_CODES.RESOURCE_FOUND,
        message: NOTIFICATION_PREFERENCE_MESSAGES.RETRIEVED,
    })
    @Permissions("NOTIFICATION_PREFERENCE_MANAGE")
    @Get(":id")
    public async get(
        @CurrentUser() user: UserPayload,
        @Param(new ZodValidationPipe(notificationPreferenceParamsSchema))
        params: NotificationPreferenceParamsDto,
    ): Promise<NotificationPreferenceResponseDto> {
        const preference = await this.getNotificationPreferenceUseCase.execute({
            actorTenantId: user.tenantId,
            actorUserId: user.userId,
            preferenceId: params.id,
        });
        return NotificationPreferenceMapper.toResponse(preference);
    }

    @ApiOperation({
        summary: "Update notification preference",
        description: "Updates the enabled flag of a notification preference of the authenticated user.",
    })
    @ApiContract(NotificationPreferenceResponseDto)
    @ApiOkResponse({ description: "Resource updated." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "Notification preference not found." })
    @ApiConflictResponse({ description: "Conflict." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: NOTIFICATION_PREFERENCE_MESSAGES.UPDATED,
    })
    @Permissions("NOTIFICATION_PREFERENCE_MANAGE")
    @HttpCode(HttpStatus.OK)
    @Patch(":id")
    public async update(
        @CurrentUser("tenantId") tenantId: string,
        @CurrentUser("userId") userId: string,
        @Param(new ZodValidationPipe(notificationPreferenceParamsSchema))
        params: NotificationPreferenceParamsDto,
        @Body(new ZodValidationPipe(updateNotificationPreferenceSchema))
        body: UpdateNotificationPreferenceRequestDto,
    ): Promise<NotificationPreferenceResponseDto> {
        const id = await this.updateNotificationPreferenceUseCase.execute({
            actorTenantId: tenantId,
            actorUserId: userId,
            preferenceId: params.id,
            enabled: body.enabled,
        });
        const preference = await this.getNotificationPreferenceUseCase.execute({
            actorTenantId: tenantId,
            actorUserId: userId,
            preferenceId: id,
        });
        return NotificationPreferenceMapper.toResponse(preference);
    }

    @ApiOperation({
        summary: "Delete notification preference",
        description: "Deletes a notification preference of the authenticated user.",
    })
    @ApiContract(DeleteNotificationPreferenceResponseDto)
    @ApiOkResponse({ description: "Resource deleted." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "Notification preference not found." })
    @ApiConflictResponse({ description: "Conflict." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({
        code: RESPONSE_CODES.RESOURCE_DELETED,
        message: NOTIFICATION_PREFERENCE_MESSAGES.DELETED,
    })
    @Permissions("NOTIFICATION_PREFERENCE_MANAGE")
    @HttpCode(HttpStatus.OK)
    @Delete(":id")
    public async delete(
        @CurrentUser() user: UserPayload,
        @Param(new ZodValidationPipe(notificationPreferenceParamsSchema))
        params: NotificationPreferenceParamsDto,
    ): Promise<DeleteNotificationPreferenceResponseDto> {
        const id = await this.deleteNotificationPreferenceUseCase.execute({
            actorTenantId: user.tenantId,
            actorUserId: user.userId,
            preferenceId: params.id,
        });
        return { id };
    }
}
