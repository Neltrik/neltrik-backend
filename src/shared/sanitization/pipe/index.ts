import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";

import { Sanitizable, SanitizationService } from "../service";

@Injectable()
export class SanitizationPipe implements PipeTransform {
    constructor(private readonly sanitizationService: SanitizationService) {}

    public transform(value: unknown, metadata: ArgumentMetadata): unknown {
        if (metadata.type !== "body" && metadata.type !== "query" && metadata.type !== "param") {
            return value;
        }
        return this.sanitizationService.sanitize(value as Sanitizable);
    }
}
