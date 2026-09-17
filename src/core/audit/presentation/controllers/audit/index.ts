import { Controller, Get, Param, Query } from "@nestjs/common";
import {
    ApiBadRequestResponse,
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
import { ZodValidationPipe } from "@/shared/zod";

import { GetAuditEventUseCase, ListAuditEventsUseCase } from "../../../application/use-cases";
import {
    AuditEventResponseDto,
    GetAuditEventParamsDto,
    ListAuditEventsQueryDto,
    ListAuditEventsResponseDto,
} from "../../dto";
import { AUDIT_MESSAGES } from "../../messages";
import { getAuditEventParamsSchema, listAuditEventsQuerySchema } from "../../schemas";

@ApiTags("Audit")
@Controller("audit-events")
export class AuditEventController {
    constructor(
        private readonly listAuditEventsUseCase: ListAuditEventsUseCase,
        private readonly getAuditEventUseCase: GetAuditEventUseCase,
    ) {}

    @ApiOperation({
        summary: "List audit events",
        description: "Returns the list of audit events.",
    })
    @ApiContract(ListAuditEventsResponseDto)
    @ApiOkResponse({
        description: "Resources retrieved successfully.",
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
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_LISTED,
        message: AUDIT_MESSAGES.LISTED,
    })
    @Permissions("AUDIT_LIST")
    @Get()
    public async list(
        @Query(new ZodValidationPipe(listAuditEventsQuerySchema))
        query: ListAuditEventsQueryDto,
    ): Promise<AuditEventResponseDto[]> {
        const events = await this.listAuditEventsUseCase.execute({
            userId: query.userId,
            tenantId: query.tenantId,
            action: query.action,
            resource: query.resource,
        });
        return events.map((event) => ({
            id: event.id,
            userId: event.userId,
            userEmail: event.userEmail,
            tenantId: event.tenantId,
            action: event.action,
            resource: event.resource,
            resourceId: event.resourceId,
            status: event.status,
            metadata: event.metadata.toJSON(),
            ipAddress: event.ipAddress?.value ?? null,
            userAgent: event.userAgent,
            createdAt: event.createdAt,
        }));
    }

    @ApiOperation({
        summary: "Get audit event",
        description: "Returns an audit event by its id.",
    })
    @ApiContract(AuditEventResponseDto)
    @ApiOkResponse({
        description: "Resource retrieved successfully.",
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
        description: "Audit event not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_FOUND,
        message: AUDIT_MESSAGES.RETRIEVED,
    })
    @Permissions("AUDIT_LIST")
    @Get(":id")
    public async get(
        @Param(new ZodValidationPipe(getAuditEventParamsSchema))
        params: GetAuditEventParamsDto,
    ): Promise<AuditEventResponseDto> {
        const result = await this.getAuditEventUseCase.execute({ id: params.id });
        const event = result.event;
        return {
            id: event.id,
            userId: event.userId,
            userEmail: event.userEmail,
            tenantId: event.tenantId,
            action: event.action,
            resource: event.resource,
            resourceId: event.resourceId,
            status: event.status,
            metadata: event.metadata.toJSON(),
            ipAddress: event.ipAddress?.value ?? null,
            userAgent: event.userAgent,
            createdAt: event.createdAt,
        };
    }
}
