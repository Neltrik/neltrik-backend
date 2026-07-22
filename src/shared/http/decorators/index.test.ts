import { HttpStatus } from "@nestjs/common";
import { DECORATORS } from "@nestjs/swagger";

import { ApiContract, Response, RESPONSE_METADATA } from "./";

interface ApiResponseMetadata {
    schema: {
        properties: {
            data: {
                type?: string;
                items?: {
                    $ref: string;
                };
            };
        };
    };
}

interface ResponseMetadata {
    code: string;
    message: string;
}

describe("ApiContract", () => {
    class TestResponseDto {}

    it("should create array response contract", () => {
        class TestController {
            @ApiContract(TestResponseDto, {
                responseType: "array",
            })
            public list(): void {}
        }
        const metadata = Reflect.getMetadata(
            DECORATORS.API_RESPONSE,
            TestController.prototype.list,
        ) as unknown as Record<number, ApiResponseMetadata | undefined>;
        const response = metadata[HttpStatus.OK];
        if (!response) {
            throw new Error("Expected response metadata");
        }
        const data = response.schema.properties.data;
        expect(data.type).toBe("array");
        expect(data.items).toBeDefined();
        expect(typeof data.items?.$ref).toBe("string");
    });

    it("should create custom status response contract", () => {
        class TestController {
            @ApiContract(TestResponseDto, {
                status: HttpStatus.CREATED,
            })
            public create(): void {}
        }
        const metadata = Reflect.getMetadata(
            DECORATORS.API_RESPONSE,
            TestController.prototype.create,
        ) as unknown as Record<number, ApiResponseMetadata | undefined>;
        expect(metadata[HttpStatus.CREATED]).toBeDefined();
    });
});

describe("Response", () => {
    it("should create response metadata decorator", () => {
        const metadata = {
            code: "VACANCY_CREATED",
            message: "Vacancy created successfully",
        };
        class TestController {
            @Response(metadata)
            public create(): void {}
        }
        const result = Reflect.getMetadata(RESPONSE_METADATA, TestController.prototype.create) as ResponseMetadata;
        expect(result).toEqual(metadata);
    });
});
