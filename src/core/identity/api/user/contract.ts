export abstract class UserApi {
    public abstract validateUserById(userId: string): Promise<void>;
    public abstract validateEmail(email: string): Promise<void>;
}
