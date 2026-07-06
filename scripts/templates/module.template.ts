import { dedent } from "../utils/dedent.utils";
import { toPascalCase } from "../utils/string.utils";

export function buildModule(moduleName: string): string {
    const className = toPascalCase(moduleName);
    return dedent(`
        import { Module } from "@nestjs/common";

        @Module({})
        export class ${className}Module {}
    `);
}
