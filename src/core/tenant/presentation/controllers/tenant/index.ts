import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";

import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ZodValidationPipe } from "@/shared/pipes/zod-validation";

import { CreateTenantInput, CreateTenantUseCase } from "../../../application/use-cases";
import { CreateTenantRequestDto, CreateTenantResultDto } from "../../dto/tenant";
import { TENANT_MESSAGES } from "../../messages";
import { createTenantSchema } from "../../schemas/tenant";

@ApiTags("Tenants")
@Controller("tenants")
export class TenantController {
    constructor(private readonly createTenantUseCase: CreateTenantUseCase) {}

    @ApiOperation({
        summary: "Create tenant",
        description: "Creates a new tenant.",
    })
    @ApiContract(CreateTenantResultDto, { status: HttpStatus.CREATED })
    @ApiCreatedResponse({
        description: "Resource created.",
    })
    @ApiBadRequestResponse({
        description: "Validation failed.",
    })
    @ApiInternalServerErrorResponse({
        description: "Internal server error.",
    })
    @Response({
        code: RESPONSE_CODES.RESOURCE_CREATED,
        message: TENANT_MESSAGES.CREATED,
    })
    @Post()
    public async create(
        @Body(new ZodValidationPipe(createTenantSchema))
        body: CreateTenantRequestDto,
    ): Promise<CreateTenantResultDto> {
        const input: CreateTenantInput = {
            name: body.name,
        };
        const tenant = await this.createTenantUseCase.execute(input);
        return { id: tenant.id };
    }
}
