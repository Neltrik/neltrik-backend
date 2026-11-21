import { z } from "zod";

import { paginationQuerySchema } from "@/shared/pagination";

export const inviteMemberSchema = z.object({
    email: z.email("Invalid email format"),
    roleId: z.uuid("Invalid role ID"),
});

export const acceptInvitationParamsSchema = z.object({
    id: z.uuid("Invalid invitation ID"),
});

export const listMembersQuerySchema = paginationQuerySchema;

export const listMyMembershipsQuerySchema = paginationQuerySchema;

export const getMembershipParamsSchema = z.object({
    id: z.uuid("Invalid membership ID"),
});

export const updateMemberRoleParamsSchema = z.object({
    id: z.uuid("Invalid membership ID"),
});

export const updateMemberRoleSchema = z.object({
    roleId: z.uuid("Invalid role ID"),
});

export const suspendMemberParamsSchema = z.object({
    id: z.uuid("Invalid membership ID"),
});

export const reactivateMemberParamsSchema = z.object({
    id: z.uuid("Invalid membership ID"),
});

export const revokeMemberParamsSchema = z.object({
    id: z.uuid("Invalid membership ID"),
});
