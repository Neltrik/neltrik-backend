import { CreateAuditEventOhsUseCase } from "../../application/use-cases-ohs";

export class CreateAuditEventOhsUseCaseSpy extends CreateAuditEventOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never, {} as never);
    }
}
