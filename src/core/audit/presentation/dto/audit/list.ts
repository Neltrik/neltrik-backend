import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { type AuditStatus } from "../../../../audit/domain/types";
import { AUDIT_ACTION, AUDIT_RESOURCE, type AuditAction, type AuditResource } from "../../../domain/catalogs";

export class ListAuditEventsQueryDto {
    @ApiPropertyOptional()
    userId?: string;

    @ApiPropertyOptional()
    tenantId?: string;

    @ApiPropertyOptional({
        enum: AUDIT_ACTION,
        example: AUDIT_ACTION.TENANT_REACTIVATED,
    })
    action?: AuditAction;

    @ApiPropertyOptional({
        enum: AUDIT_RESOURCE,
        example: AUDIT_RESOURCE.TENANT,
    })
    resource?: AuditResource;
}

export class AuditEventResponseDto {
    @ApiProperty({
        example: "550e8400-e29b-41d4-a716-446655440000",
        description: "ID del evento",
    })
    id!: string;

    @ApiProperty({ nullable: true })
    userId!: string | null;

    @ApiProperty({ nullable: true })
    userEmail!: string | null;

    @ApiProperty({ nullable: true })
    tenantId!: string | null;

    @ApiProperty()
    action!: string;

    @ApiProperty()
    resource!: string;

    @ApiProperty({ nullable: true })
    resourceId!: string | null;

    @ApiProperty()
    status!: AuditStatus;

    @ApiProperty()
    metadata!: Record<string, unknown>;

    @ApiProperty({ nullable: true })
    ipAddress!: string | null;

    @ApiProperty({ nullable: true })
    userAgent!: string | null;

    @ApiProperty()
    createdAt!: Date;
}

export class ListAuditEventsResponseDto {
    @ApiProperty({ type: [AuditEventResponseDto] })
    events!: AuditEventResponseDto[];
}
