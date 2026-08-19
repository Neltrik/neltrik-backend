import { UserNotFoundError } from "../../../../domain/errors";
import { Email } from "../../../../domain/value-objects";
import { UserRepositorySpy } from "../../../../test-doubles";
import { ValidateUserByEmailOhsUseCase } from "./index";

const makeEmail = () => Email.create("john.doe@example.com");

describe("ValidateUserByEmailOhsUseCase", () => {
    const makeSut = () => {
        const userRepository = new UserRepositorySpy();
        userRepository.existsByEmail.mockResolvedValue(true);
        const useCase = new ValidateUserByEmailOhsUseCase(userRepository);
        return { useCase, userRepository };
    };

    it("should validate the user email successfully", async () => {
        const { useCase, userRepository } = makeSut();
        const email = makeEmail();
        await useCase.execute(email);
        expect(userRepository.existsByEmail).toHaveBeenCalledTimes(1);
        expect(userRepository.existsByEmail).toHaveBeenCalledWith(email);
    });

    it("should throw UserNotFoundError when the email does not exist", async () => {
        const { useCase, userRepository } = makeSut();
        const email = makeEmail();
        userRepository.existsByEmail.mockResolvedValue(false);
        await expect(useCase.execute(email)).rejects.toThrow(UserNotFoundError);
        expect(userRepository.existsByEmail).toHaveBeenCalledWith(email);
    });

    it("should propagate user repository errors", async () => {
        const { useCase, userRepository } = makeSut();
        const email = makeEmail();
        userRepository.existsByEmail.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(email)).rejects.toThrow("Database error");
    });
});
