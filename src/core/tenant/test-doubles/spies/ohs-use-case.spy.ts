import {
    ConsumeInvitationOhsUseCase,
    GetTenantOhsUseCase,
    ValidateInvitationOhsUseCase,
} from "../../application/use-cases-ohs";

export class ConsumeInvitationOhsUseCaseSpy extends ConsumeInvitationOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never);
    }
}

export class GetTenantOhsUseCaseSpy extends GetTenantOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never);
    }
}

export class ValidateInvitationOhsUseCaseSpy extends ValidateInvitationOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never);
    }
}
