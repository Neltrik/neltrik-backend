import { GetRolesByTenantOhsUseCase } from "../../application/use-cases-ohs";

export class GetRolesByTenantOhsUseCaseSpy extends GetRolesByTenantOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never);
    }
}
