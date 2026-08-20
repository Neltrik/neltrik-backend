import { GetUserByIdOhsUseCaseSpy, RegisterUserOhsUseCaseSpy } from "../../test-doubles";
import { UserApiImpl } from "./index";
import { RegisterUserRequestDto, RegisterUserResultDto } from "./result.dto";

const makeSut = () => {
    const registerUserOhsUseCase = new RegisterUserOhsUseCaseSpy();
    const getUserByIdOhsUseCase = new GetUserByIdOhsUseCaseSpy();
    const userApi = new UserApiImpl(registerUserOhsUseCase, getUserByIdOhsUseCase);
    return { userApi, registerUserOhsUseCase, getUserByIdOhsUseCase };
};

describe("UserApiImpl", () => {
    describe("create", () => {
        it("should register a user successfully", async () => {
            const { userApi, registerUserOhsUseCase } = makeSut();
            const input: RegisterUserRequestDto = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                tenantId: "tenant-id",
                roleId: "role-id",
            };
            const output: RegisterUserResultDto = { id: "user-id" };
            registerUserOhsUseCase.execute.mockResolvedValue(output);
            const result = await userApi.create(input);
            expect(registerUserOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(registerUserOhsUseCase.execute).toHaveBeenCalledWith(input);
            expect(result).toEqual(output);
        });

        it("should propagate user registration errors", async () => {
            const { userApi, registerUserOhsUseCase } = makeSut();
            const input: RegisterUserRequestDto = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                tenantId: "tenant-id",
                roleId: "role-id",
            };
            registerUserOhsUseCase.execute.mockRejectedValue(new Error("Email already exists"));
            await expect(userApi.create(input)).rejects.toThrow("Email already exists");
            expect(registerUserOhsUseCase.execute).toHaveBeenCalledWith(input);
        });
    });

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
            expect(getUserByIdOhsUseCase.execute).toHaveBeenCalledWith("user-id");
        });
    });

    describe("DTO", () => {
        it("should create a register user request dto", () => {
            const dto = new RegisterUserRequestDto();
            dto.firstName = "John";
            dto.lastName = "Doe";
            dto.email = "john.doe@example.com";
            dto.tenantId = "tenant-id";
            dto.roleId = "role-id";
            expect(dto).toEqual({
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                tenantId: "tenant-id",
                roleId: "role-id",
            });
        });

        it("should create a register user result dto", () => {
            const dto = new RegisterUserResultDto();
            dto.id = "user-id";
            expect(dto).toEqual({ id: "user-id" });
        });
    });
});
