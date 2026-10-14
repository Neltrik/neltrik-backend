import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Query,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiConsumes,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { CurrentUser } from "@/shared/auth";
import { Permissions } from "@/shared/authorization";
import { ApiContract, Response, RESPONSE_CODES } from "@/shared/http";
import { ResponsePayload } from "@/shared/pagination";
import { ZodValidationPipe } from "@/shared/zod";

import {
    ChangeFileResourceUseCase,
    DeleteFileUseCase,
    GetDownloadUrlUseCase,
    GetFileUseCase,
    ListFilesUseCase,
    RenameFileUseCase,
    ReplaceFileUseCase,
    UploadFileUseCase,
} from "../../../application/use-cases";
import {
    ChangeFileResourceRequestDto,
    DeleteFileResponseDto,
    GetDownloadUrlResponseDto,
    GetFileResponseDto,
    ListFilesQueryDto,
    RenameFileRequestDto,
    UploadFileRequestDto,
} from "../../dto";
import { FILE_MESSAGES } from "../../messages";
import {
    changeFileResourceBodySchema,
    deleteFileParamsSchema,
    getDownloadUrlParamsSchema,
    getFileParamsSchema,
    listFilesQuerySchema,
    renameFileBodySchema,
    replaceFileParamsSchema,
    uploadFileBodySchema,
} from "../../schemas";
import { FileControllerHelper } from "./helper";

@ApiTags("File Storage - Files")
@Controller("file-storage/files")
export class FileController {
    constructor(
        private readonly changeFileResourceUseCase: ChangeFileResourceUseCase,
        private readonly deleteFileUseCase: DeleteFileUseCase,
        private readonly getDownloadUrlUseCase: GetDownloadUrlUseCase,
        private readonly getFileUseCase: GetFileUseCase,
        private readonly listFilesUseCase: ListFilesUseCase,
        private readonly renameFileUseCase: RenameFileUseCase,
        private readonly replaceFileUseCase: ReplaceFileUseCase,
        private readonly uploadFileUseCase: UploadFileUseCase,
    ) {}

    @ApiOperation({
        summary: "Upload file",
        description: "Uploads a new file.",
    })
    @ApiConsumes("multipart/form-data")
    @ApiContract(GetFileResponseDto)
    @ApiOkResponse({ description: "Resource created." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_CREATED, message: FILE_MESSAGES.CREATED })
    @Throttle({ default: { limit: 20, ttl: 900000 } })
    @Permissions("ADMIN_FILE_CREATE")
    @Post()
    @UseInterceptors(FileInterceptor("file"))
    public async upload(
        @CurrentUser("userId") userId: string,
        @CurrentUser("tenantId") tenantId: string,
        @UploadedFile() file: Express.Multer.File | undefined,
        @Body(new ZodValidationPipe(uploadFileBodySchema)) body: UploadFileRequestDto,
    ): Promise<GetFileResponseDto> {
        if (!file) {
            throw new BadRequestException("File is required.");
        }
        const output = await this.uploadFileUseCase.execute({
            tenantId,
            ownerId: userId,
            buffer: file.buffer,
            name: file.originalname,
            extension: FileControllerHelper.extractExtension(file.originalname),
            mimeType: file.mimetype,
            size: file.size,
            purpose: body.purpose,
            resourceType: body.resourceType,
            resourceId: body.resourceId,
        });
        return FileControllerHelper.toFileResponse(output);
    }

    @ApiOperation({
        summary: "List files",
        description: "Returns a paginated list of files.",
    })
    @ApiContract(GetFileResponseDto, { responseType: "array" })
    @ApiOkResponse({ description: "Resources retrieved successfully." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_LISTED, message: FILE_MESSAGES.LISTED })
    @Permissions("ADMIN_FILE_LIST")
    @Get()
    public async list(
        @CurrentUser("tenantId") tenantId: string,
        @Query(new ZodValidationPipe(listFilesQuerySchema)) query: ListFilesQueryDto,
    ): Promise<ResponsePayload<GetFileResponseDto[]>> {
        const { files, meta } = await this.listFilesUseCase.execute({
            tenantId,
            ownerId: query.ownerId,
            resourceType: query.resourceType,
            resourceId: query.resourceId,
            purpose: query.purpose,
            status: query.status,
            cursor: query.cursor,
            limit: query.limit,
        });
        return { data: files.map((file) => FileControllerHelper.toFileResponse(file)), meta };
    }

    @ApiOperation({
        summary: "Get download URL",
        description: "Generates a short-lived signed URL to download a file.",
    })
    @ApiContract(GetDownloadUrlResponseDto)
    @ApiOkResponse({ description: "Resource found." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "File not found." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({
        code: RESPONSE_CODES.RESOURCE_FOUND,
        message: FILE_MESSAGES.DOWNLOAD_URL_GENERATED,
    })
    @Permissions("ADMIN_FILE_VIEW")
    @Get(":fileId/download")
    public async getDownloadUrl(
        @Param(new ZodValidationPipe(getDownloadUrlParamsSchema)) params: { fileId: string },
    ): Promise<GetDownloadUrlResponseDto> {
        const output = await this.getDownloadUrlUseCase.execute(params.fileId);
        return {
            url: output.url,
            expiresIn: output.expiresIn,
            name: output.name,
            mimeType: output.mimeType,
            size: output.size,
        };
    }

    @ApiOperation({
        summary: "Get file",
        description: "Gets the metadata of a file by its identifier.",
    })
    @ApiContract(GetFileResponseDto)
    @ApiOkResponse({ description: "Resource found." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "File not found." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_FOUND, message: FILE_MESSAGES.RETRIEVED })
    @Permissions("ADMIN_FILE_VIEW")
    @Get(":fileId")
    public async get(
        @Param(new ZodValidationPipe(getFileParamsSchema)) params: { fileId: string },
    ): Promise<GetFileResponseDto> {
        const output = await this.getFileUseCase.execute(params.fileId);
        return FileControllerHelper.toFileResponse(output);
    }

    @ApiOperation({
        summary: "Rename file",
        description: "Updates the name of an existing file.",
    })
    @ApiContract(GetFileResponseDto)
    @ApiOkResponse({ description: "Resource updated." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "File not found." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_UPDATED, message: FILE_MESSAGES.UPDATED })
    @Throttle({ default: { limit: 20, ttl: 900000 } })
    @Permissions("ADMIN_FILE_UPDATE_METADATA")
    @Patch(":fileId/name")
    public async rename(
        @Param(new ZodValidationPipe(getFileParamsSchema)) params: { fileId: string },
        @Body(new ZodValidationPipe(renameFileBodySchema)) body: RenameFileRequestDto,
    ): Promise<GetFileResponseDto> {
        const output = await this.renameFileUseCase.execute({ fileId: params.fileId, name: body.name });
        return FileControllerHelper.toFileResponse(output);
    }

    @ApiOperation({
        summary: "Change file resource",
        description: "Updates the external resource associated with an existing file.",
    })
    @ApiContract(GetFileResponseDto)
    @ApiOkResponse({ description: "Resource updated." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "File not found." })
    @ApiConflictResponse({ description: "File Conflict" })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_UPDATED, message: FILE_MESSAGES.UPDATED })
    @Throttle({ default: { limit: 20, ttl: 900000 } })
    @Permissions("ADMIN_FILE_UPDATE_METADATA")
    @Patch(":fileId/resource")
    public async changeResource(
        @Param(new ZodValidationPipe(getFileParamsSchema)) params: { fileId: string },
        @Body(new ZodValidationPipe(changeFileResourceBodySchema)) body: ChangeFileResourceRequestDto,
    ): Promise<GetFileResponseDto> {
        const output = await this.changeFileResourceUseCase.execute({
            fileId: params.fileId,
            resourceType: body.resourceType,
            resourceId: body.resourceId,
        });
        return FileControllerHelper.toFileResponse(output);
    }

    @ApiOperation({
        summary: "Replace file",
        description: "Replaces the binary of an existing file by adding a new version.",
    })
    @ApiConsumes("multipart/form-data")
    @ApiContract(GetFileResponseDto)
    @ApiOkResponse({ description: "Resource updated." })
    @ApiBadRequestResponse({ description: "Validation failed." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "File not found." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_UPDATED, message: FILE_MESSAGES.UPDATED })
    @Throttle({ default: { limit: 20, ttl: 900000 } })
    @Permissions("ADMIN_FILE_UPDATE")
    @Put(":fileId")
    @UseInterceptors(FileInterceptor("file"))
    public async replace(
        @Param(new ZodValidationPipe(replaceFileParamsSchema)) params: { fileId: string },
        @UploadedFile() file: Express.Multer.File | undefined,
    ): Promise<GetFileResponseDto> {
        if (!file) {
            throw new BadRequestException("File is required.");
        }
        const output = await this.replaceFileUseCase.execute({
            fileId: params.fileId,
            buffer: file.buffer,
            name: file.originalname,
            extension: FileControllerHelper.extractExtension(file.originalname),
            mimeType: file.mimetype,
            size: file.size,
        });
        return FileControllerHelper.toFileResponse(output);
    }

    @ApiOperation({
        summary: "Delete file",
        description: "Logically deletes a file by its identifier.",
    })
    @ApiContract(DeleteFileResponseDto)
    @ApiOkResponse({ description: "Resource deleted." })
    @ApiUnauthorizedResponse({ description: "Unauthorized." })
    @ApiForbiddenResponse({ description: "Forbidden." })
    @ApiNotFoundResponse({ description: "File not found." })
    @ApiInternalServerErrorResponse({ description: "Internal server error." })
    @Response({ code: RESPONSE_CODES.RESOURCE_DELETED, message: FILE_MESSAGES.DELETED })
    @Throttle({ default: { limit: 20, ttl: 900000 } })
    @Permissions("ADMIN_FILE_DELETE")
    @Delete(":fileId")
    public async delete(
        @Param(new ZodValidationPipe(deleteFileParamsSchema)) params: { fileId: string },
    ): Promise<DeleteFileResponseDto> {
        const output = await this.deleteFileUseCase.execute(params.fileId);
        return { id: output.id };
    }
}
