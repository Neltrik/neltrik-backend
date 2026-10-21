import { SendNotificationOhsUseCase } from "../../application/use-cases-ohs";

export class SendNotificationOhsUseCaseSpy extends SendNotificationOhsUseCase {
    public override execute = jest.fn();

    constructor() {
        super({} as never, {} as never, {} as never, {} as never, {} as never);
    }
}
