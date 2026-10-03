import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
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

import { CurrentUser } from "@/shared/auth";
import { Permissions, PublicPermission } from "@/shared/authorization";
import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/zod";

import { AdjustQuotaLimitInput, AdjustQuotaLimitUseCase, GetFileQuotaUseCase } from "../../../application/use-cases";
import { AdjustQuotaLimitParamsDto, AdjustQuotaLimitRequestDto, GetFileQuotaResponseDto } from "../../dto";
import { FILE_QUOTA_MESSAGES } from "../../messages";
import { adjustQuotaLimitParamsSchema, adjustQuotaLimitSchema } from "../../schemas";

@ApiTags("File Storage - Quota")
@Controller("file-storage/quota")
export class FileStorageQuotaController {
    constructor(
        private readonly getFileQuotaUseCase: GetFileQuotaUseCase,
        private readonly adjustQuotaLimitUseCase: AdjustQuotaLimitUseCase,
    ) {}

    @ApiOperation({
        summary: "Get file quota",
        description: "Gets the current file quota of the authenticated tenant.",
    })
    @ApiContract(GetFileQuotaResponseDto)
    @ApiOkResponse({
        description: "Resource found.",
    })
    @ApiUnauthorizedResponse({
        description: "Unauthorized.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_FOUND,
        message: FILE_QUOTA_MESSAGES.RETRIEVED,
    })
    @PublicPermission()
    @Get()
    public async get(@CurrentUser("tenantId") tenantId: string): Promise<GetFileQuotaResponseDto> {
        const output = await this.getFileQuotaUseCase.execute(tenantId);
        return {
            limitBytes: output.limitBytes,
            usedBytes: output.usedBytes,
            availableBytes: output.availableBytes,
            isNearLimit: output.isNearLimit,
            isOverLimit: output.isOverLimit,
        };
    }

    @ApiOperation({
        summary: "Adjust file quota limit",
        description: "Adjusts the file quota limit of a tenant.",
    })
    @ApiContract(GetFileQuotaResponseDto)
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
        description: "File quota not found.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_UPDATED,
        message: FILE_QUOTA_MESSAGES.UPDATED,
    })
    @Permissions("PLATFORM_FILE_QUOTA_UPDATE")
    @Patch(":tenantId")
    public async adjust(
        @Param(new ZodValidationPipe(adjustQuotaLimitParamsSchema))
        params: AdjustQuotaLimitParamsDto,
        @Body(new ZodValidationPipe(adjustQuotaLimitSchema))
        body: AdjustQuotaLimitRequestDto,
    ): Promise<GetFileQuotaResponseDto> {
        const input: AdjustQuotaLimitInput = {
            tenantId: params.tenantId,
            newLimitBytes: body.newLimitBytes,
        };
        const quota = await this.adjustQuotaLimitUseCase.execute(input);
        return {
            limitBytes: quota.limitBytes,
            usedBytes: quota.usedBytes,
            availableBytes: quota.getAvailableBytes(),
            isNearLimit: quota.isNearLimit(),
            isOverLimit: quota.isOverLimit(),
        };
    }
}
