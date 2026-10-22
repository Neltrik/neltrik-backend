import { Controller, Get, HttpCode, HttpStatus, Param, Patch, Query } from "@nestjs/common";
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
import { ResponsePayload } from "@/shared/pagination";
import { ZodValidationPipe } from "@/shared/zod";

import {
    ListNotificationsUseCase,
    MarkAllNotificationsAsReadUseCase,
    MarkNotificationAsReadUseCase,
} from "../../../application/use-cases";
import {
    ListNotificationResponseDto,
    ListNotificationsQueryDto,
    MarkAllNotificationsAsReadResponseDto,
    MarkNotificationAsReadParamsDto,
    MarkNotificationAsReadResponseDto,
} from "../../dto";
import { NotificationMapper } from "../../mappers";
import { NOTIFICATION_MESSAGES } from "../../messages";
import { listNotificationsQuerySchema, markNotificationAsReadParamsSchema } from "../../schemas";

@ApiTags("Notifications")
@Controller("notifications")
export class NotificationController {
    constructor(
        private readonly listNotificationsUseCase: ListNotificationsUseCase,
        private readonly markAllNotificationsAsReadUseCase: MarkAllNotificationsAsReadUseCase,
        private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
    ) {}

    @ApiOperation({
        summary: "List notifications",
        description: "Lists the in-app notifications of the authenticated recipient with cursor pagination.",
    })
    @ApiContract(ListNotificationResponseDto)
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
        description: "Not found.",
    })
    @ApiConflictResponse({
        description: "Conflict.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_FOUND,
        message: NOTIFICATION_MESSAGES.LISTED,
    })
    @Permissions("NOTIFICATION_LIST")
    @Get()
    public async list(
        @CurrentUser("tenantId") tenantId: string,
        @CurrentUser("userId") userId: string,
        @Query(new ZodValidationPipe(listNotificationsQuerySchema))
        query: ListNotificationsQueryDto,
    ): Promise<ResponsePayload<ListNotificationResponseDto[]>> {
        const output = await this.listNotificationsUseCase.execute({
            actorTenantId: tenantId,
            actorUserId: userId,
            cursor: query.cursor,
            limit: query.limit,
        });
        return { data: NotificationMapper.toResponse(output.notifications), meta: output.meta };
    }

    @ApiOperation({
        summary: "Mark notification as read",
        description: "Marks a single in-app notification of the authenticated recipient as read.",
    })
    @ApiContract(MarkNotificationAsReadResponseDto)
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
        description: "Notification not found.",
    })
    @ApiConflictResponse({
        description: "Conflict.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: NOTIFICATION_MESSAGES.MARKED_AS_READ,
    })
    @Permissions("NOTIFICATION_MARK_READ")
    @HttpCode(HttpStatus.OK)
    @Patch(":id/read")
    public async markAsRead(
        @CurrentUser("tenantId") tenantId: string,
        @CurrentUser("userId") userId: string,
        @Param(new ZodValidationPipe(markNotificationAsReadParamsSchema))
        params: MarkNotificationAsReadParamsDto,
    ): Promise<MarkNotificationAsReadResponseDto> {
        const id = await this.markNotificationAsReadUseCase.execute({
            actorTenantId: tenantId,
            actorUserId: userId,
            notificationId: params.id,
        });
        return { id };
    }

    @ApiOperation({
        summary: "Mark all notifications as read",
        description: "Marks all in-app notifications of the authenticated recipient as read.",
    })
    @ApiContract(MarkAllNotificationsAsReadResponseDto)
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
        description: "Not found.",
    })
    @ApiConflictResponse({
        description: "Conflict.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: NOTIFICATION_MESSAGES.ALL_MARKED_AS_READ,
    })
    @Permissions("NOTIFICATION_MARK_ALL_READ")
    @HttpCode(HttpStatus.OK)
    @Patch("read-all")
    public async markAllAsRead(
        @CurrentUser("tenantId") tenantId: string,
        @CurrentUser("userId") userId: string,
    ): Promise<MarkAllNotificationsAsReadResponseDto> {
        const updatedCount = await this.markAllNotificationsAsReadUseCase.execute({
            actorTenantId: tenantId,
            actorUserId: userId,
        });
        return { updatedCount };
    }
}
