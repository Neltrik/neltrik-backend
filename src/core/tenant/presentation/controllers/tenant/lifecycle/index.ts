import { Controller, Param, Patch } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { Permissions } from "@/shared/authorization";
import { Response, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/zod";

import { ReactivateTenantUseCase, SuspendTenantUseCase } from "../../../../application/use-cases";
import { ReactivateTenantParamsDto, SuspendTenantParamsDto } from "../../../dto";
import { TENANT_MESSAGES } from "../../../messages";
import { reactivateTenantParamsSchema, suspendTenantParamsSchema } from "../../../schemas";

@ApiTags("Tenants")
@Controller("tenants")
export class TenantLifecycleController {
    constructor(
        private readonly reactivateTenantUseCase: ReactivateTenantUseCase,
        private readonly suspendTenantUseCase: SuspendTenantUseCase,
    ) {}

    @ApiOperation({
        summary: "Suspend tenant",
        description: "Suspends an existing tenant.",
    })
    @ApiNoContentResponse({
        description: "Tenant suspended successfully.",
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
        description: "Tenant not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: TENANT_MESSAGES.SUSPENDED,
    })
    @Throttle({ default: { limit: 10, ttl: 3600000 } })
    @Permissions("TENANT_SUSPEND")
    @Patch(":id/suspend")
    public async suspend(
        @Param(new ZodValidationPipe(suspendTenantParamsSchema))
        params: SuspendTenantParamsDto,
    ): Promise<void> {
        await this.suspendTenantUseCase.execute(params.id);
    }

    @ApiOperation({
        summary: "Reactivate tenant",
        description: "Reactivates a suspended tenant.",
    })
    @ApiNoContentResponse({
        description: "Tenant reactivated successfully.",
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
        description: "Tenant not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: TENANT_MESSAGES.REACTIVATED,
    })
    @Throttle({ default: { limit: 10, ttl: 3600000 } })
    @Permissions("TENANT_REACTIVATE")
    @Patch(":id/reactivate")
    public async reactivate(
        @Param(new ZodValidationPipe(reactivateTenantParamsSchema))
        params: ReactivateTenantParamsDto,
    ): Promise<void> {
        await this.reactivateTenantUseCase.execute(params.id);
    }
}
