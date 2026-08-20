import type { RegisterUserRequestDto, RegisterUserResultDto } from "./result.dto";

export abstract class UserApi {
    public abstract create(input: RegisterUserRequestDto): Promise<RegisterUserResultDto>;
    public abstract validateUserById(userId: string): Promise<void>;
}
