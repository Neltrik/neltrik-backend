import { GetUserByIdOhsUseCase, ValidateUserByEmailOhsUseCase } from "../../application/use-cases-ohs";

export class GetUserByIdOhsUseCaseSpy extends GetUserByIdOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never);
    }
}

export class ValidateUserByEmailOhsUseCaseSpy extends ValidateUserByEmailOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never);
    }
}
