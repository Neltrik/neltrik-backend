export interface UpdateCompanyInput {
    actorTenantId: string;
    actorUserId: string;
    id: string;
    name?: string | undefined;
    slug?: string | undefined;
}
