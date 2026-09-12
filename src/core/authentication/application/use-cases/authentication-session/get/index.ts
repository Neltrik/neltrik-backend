import { Injectable } from "@nestjs/common";

import { SessionNotFoundError } from "../../../../domain/errors";
import { AuthenticationSessionRepository } from "../../../../domain/interfaces";
import { GetSessionInput } from "./input";
import { GetSessionOutput } from "./output";

@Injectable()
export class GetSessionUseCase {
    constructor(private readonly sessionRepository: AuthenticationSessionRepository) {}

    public async execute(input: GetSessionInput): Promise<GetSessionOutput> {
        const session = await this.sessionRepository.findById(input.sessionId);
        if (!session) {
            throw new SessionNotFoundError();
        }
        return {
            id: session.id,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            lastUsedAt: session.lastUsedAt,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt.value,
            isRevoked: session.isRevoked(),
        };
    }
}
