import type { RegisterUserRequestDto, RegisterUserResultDto } from "@/core/identity/api";

export class UserApiSpy {
    public validateUserById = jest.fn<Promise<void>, [string]>();
    public create = jest.fn<Promise<RegisterUserResultDto>, [RegisterUserRequestDto]>();
}
