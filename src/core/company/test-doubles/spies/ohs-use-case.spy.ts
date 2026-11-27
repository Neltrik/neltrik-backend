import {
    CreateCompanyOhsUseCase,
    CreateMembershipOhsUseCase,
    DeleteCompanyOhsUseCase,
} from "../../application/use-cases-ohs";

export class CreateCompanyOhsUseCaseSpy extends CreateCompanyOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never, {} as never);
    }
}

export class CreateMembershipOhsUseCaseSpy extends CreateMembershipOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never, {} as never, {} as never);
    }
}

export class DeleteCompanyOhsUseCaseSpy extends DeleteCompanyOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never);
    }
}
