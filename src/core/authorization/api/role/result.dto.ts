import { type RoleScope } from "../../domain/types";

export class RoleResultDto {
    id!: string;
    code!: string;
    defaultDisplayName!: string;
    description!: string;
    scope!: RoleScope;
}
