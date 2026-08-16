import {
    CanAssignRoleToTenantOhsUseCase,
    GetRoleOhsUseCase,
    GetRolesByTenantOhsUseCase,
} from "../../application/use-cases-ohs";

export class CanAssignRoleToTenantOhsUseCaseSpy extends CanAssignRoleToTenantOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never);
    }
}

export class GetRoleOhsUseCaseSpy extends GetRoleOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never);
    }
}

export class GetRolesByTenantOhsUseCaseSpy extends GetRolesByTenantOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never, {} as never);
    }
}
