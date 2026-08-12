import { GetTenantUseCase } from "../../application/use-cases";

export class GetTenantUseCaseSpy extends GetTenantUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never);
    }
}
