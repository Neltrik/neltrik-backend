import { SetMetadata } from "@nestjs/common";

export interface ResponseMetadata {
    code: string;
    message: string;
}
export const RESPONSE_METADATA = "response:metadata";
export const Response = (metadata: ResponseMetadata) => SetMetadata(RESPONSE_METADATA, metadata);
