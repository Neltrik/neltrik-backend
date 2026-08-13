import { GetTenantOhsUseCase } from "../../application/use-cases-ohs";

export class GetTenantOhsUseCaseSpy extends GetTenantOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never);
    }
}
