import { Injectable } from "@nestjs/common";

import { PermissionChecker } from "@/shared/authorization";

import { UserHasPermissionUseCase } from "../../../application/use-cases";

@Injectable()
export class PermissionCheckerProvider extends PermissionChecker {
    constructor(private readonly userHasPermissionUseCase: UserHasPermissionUseCase) {
        super();
    }

    public async hasPermission(userId: string, permission: string): Promise<boolean> {
        const hasPermission = await this.userHasPermissionUseCase.execute({ userId, code: permission });
        return hasPermission;
    }
}
