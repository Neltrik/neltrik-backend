import type { DeleteUserResultDto, RegisterUserRequestDto, RegisterUserResultDto } from "@/core/identity/api";
import type { ConsumeInvitationResultDto, InvitationResultDto } from "@/core/tenant/api";

export class InvitationApiSpy {
    public validate = jest.fn<Promise<InvitationResultDto>, [string]>();
    public consume = jest.fn<Promise<ConsumeInvitationResultDto>, [string]>();
}

export class UserApiSpy {
    public create = jest.fn<Promise<RegisterUserResultDto>, [RegisterUserRequestDto]>();
    public validateUserById = jest.fn<Promise<void>, [string]>();
    public delete = jest.fn<Promise<DeleteUserResultDto>, [string]>();
}
