import { applyDecorators, type Type } from "@nestjs/common";
import { ApiExtraModels, ApiResponse, getSchemaPath } from "@nestjs/swagger";

export function ApiResponseContract<TModel extends Type<unknown>>(model: TModel): MethodDecorator {
    return applyDecorators(
        ApiExtraModels(model),
        ApiResponse({
            status: 201,
            schema: {
                type: "object",
                properties: {
                    data: {
                        $ref: getSchemaPath(model),
                    },
                    code: {
                        type: "string",
                    },
                    message: {
                        type: "string",
                    },
                    details: {
                        type: "array",
                        items: {
                            type: "object",
                            additionalProperties: true,
                        },
                    },
                    meta: {
                        type: "object",
                        additionalProperties: true,
                    },
                },
            },
        }),
    );
}
