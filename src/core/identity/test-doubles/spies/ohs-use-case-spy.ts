import { DeleteUserOhsUseCase, GetUserByIdOhsUseCase, RegisterUserOhsUseCase } from "../../application/use-cases-ohs";

export class RegisterUserOhsUseCaseSpy extends RegisterUserOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never, {} as never);
    }
}

export class GetUserByIdOhsUseCaseSpy extends GetUserByIdOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never);
    }
}

export class DeleteUserOhsUseCaseSpy extends DeleteUserOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never);
    }
}
