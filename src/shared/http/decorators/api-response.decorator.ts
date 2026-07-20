import { applyDecorators, HttpStatus, type Type } from "@nestjs/common";
import { ApiExtraModels, ApiResponse, getSchemaPath } from "@nestjs/swagger";

interface ApiResponseContractOptions {
    responseType?: "object" | "array";
    status?: HttpStatus;
}

export function ApiContract<TModel extends Type<unknown>>(
    model: TModel,
    { responseType = "object", status = HttpStatus.OK }: ApiResponseContractOptions = {},
): MethodDecorator {
    const data =
        responseType === "array"
            ? {
                  type: "array",
                  items: {
                      $ref: getSchemaPath(model),
                  },
              }
            : {
                  $ref: getSchemaPath(model),
              };

    return applyDecorators(
        ApiExtraModels(model),
        ApiResponse({
            status,
            schema: {
                type: "object",
                properties: {
                    data,
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
