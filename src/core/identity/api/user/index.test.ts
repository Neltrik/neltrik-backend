import { Email } from "../../domain/value-objects";
import { GetUserByIdOhsUseCaseSpy, ValidateUserByEmailOhsUseCaseSpy } from "../../test-doubles";
import { UserApiImpl } from "./index";

const makeSut = () => {
    const validateUserByEmailOhsUseCase = new ValidateUserByEmailOhsUseCaseSpy();
    const getUserByIdOhsUseCase = new GetUserByIdOhsUseCaseSpy();
    const userApi = new UserApiImpl(validateUserByEmailOhsUseCase, getUserByIdOhsUseCase);
    return { userApi, validateUserByEmailOhsUseCase, getUserByIdOhsUseCase };
};

describe("UserApiImpl", () => {
    describe("validateUserById", () => {
        it("should validate that the user exists", async () => {
            const { userApi, getUserByIdOhsUseCase } = makeSut();
            await userApi.validateUserById("user-id");
            expect(getUserByIdOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(getUserByIdOhsUseCase.execute).toHaveBeenCalledWith("user-id");
        });

        it("should propagate user validation errors", async () => {
            const { userApi, getUserByIdOhsUseCase } = makeSut();
            getUserByIdOhsUseCase.execute.mockRejectedValue(new Error("User not found"));
            await expect(userApi.validateUserById("user-id")).rejects.toThrow("User not found");
            expect(getUserByIdOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(getUserByIdOhsUseCase.execute).toHaveBeenCalledWith("user-id");
        });
    });

    describe("validateEmail", () => {
        it("should validate that the email exists", async () => {
            const { userApi, validateUserByEmailOhsUseCase } = makeSut();
            validateUserByEmailOhsUseCase.execute.mockImplementation((email) => {
                expect(email).toEqual(Email.create("john.doe@example.com"));
            });
            await userApi.validateEmail("john.doe@example.com");
            expect(validateUserByEmailOhsUseCase.execute).toHaveBeenCalledTimes(1);
        });

        it("should normalize the email before validating it", async () => {
            const { userApi, validateUserByEmailOhsUseCase } = makeSut();
            validateUserByEmailOhsUseCase.execute.mockImplementation((email) => {
                expect(email).toEqual(Email.create("john.doe@example.com"));
            });
            await userApi.validateEmail("  JOHN.DOE@EXAMPLE.COM  ");
            expect(validateUserByEmailOhsUseCase.execute).toHaveBeenCalledTimes(1);
        });

        it("should propagate email validation errors", async () => {
            const { userApi, validateUserByEmailOhsUseCase } = makeSut();
            validateUserByEmailOhsUseCase.execute.mockRejectedValue(new Error("Email not found"));
            await expect(userApi.validateEmail("john.doe@example.com")).rejects.toThrow("Email not found");
            expect(validateUserByEmailOhsUseCase.execute).toHaveBeenCalledTimes(1);
        });
    });
});
