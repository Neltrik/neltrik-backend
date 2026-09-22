import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { map, Observable } from "rxjs";

import { ResponseBuilder } from "../builders";
import { RESPONSE_METADATA, ResponseMetadata } from "../decorators";
import { extractPayload } from "./extractPayload";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    constructor(private readonly reflector: Reflector) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const metadata = this.reflector.get<ResponseMetadata | undefined>(RESPONSE_METADATA, context.getHandler());
        if (!metadata) {
            throw new Error("Response metadata was not found.");
        }
        return next.handle().pipe(
            map((result) => {
                const { data, meta } = extractPayload(result);
                return ResponseBuilder.build(data, metadata.code, metadata.message, [], meta);
            }),
        );
    }
}
