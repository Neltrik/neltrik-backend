import { z } from "zod";

import { paginationQuerySchema } from "@/shared/pagination";

import { MEMBERSHIP_STATUSES } from "../../../domain/types/membership";

export const inviteMemberSchema = z.object({
    userId: z.uuid("Invalid user ID"),
    roleId: z.uuid("Invalid role ID"),
});

export const listMyMembershipsQuerySchema = paginationQuerySchema.extend({
    status: z.enum(MEMBERSHIP_STATUSES).optional(),
});

export const acceptInvitationParamsSchema = z.object({
    id: z.uuid("Invalid invitation ID"),
});

export const listMembersQuerySchema = paginationQuerySchema;

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
