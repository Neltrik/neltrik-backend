import { type ResponsePayload } from "@/shared/pagination";

import type { GetMembershipResponseDto } from "../../dto";

export class MembershipMapper {
    public static toResponse(
        output: ResponsePayload<GetMembershipResponseDto[]>,
    ): ResponsePayload<GetMembershipResponseDto[]> {
        return {
            data: output.data.map((membership) => ({
                id: membership.id,
                userId: membership.userId,
                companyId: membership.companyId,
                roleId: membership.roleId,
                status: membership.status,
                createdAt: membership.createdAt,
                updatedAt: membership.updatedAt,
            })),
            meta: output.meta,
        };
    }
}
