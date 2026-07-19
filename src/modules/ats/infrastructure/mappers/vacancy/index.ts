import { type Vacancy } from "../../../domain/entities/vacancy";
import { MESSAGES } from "../message";

export class VacancyMapper {
    public static toPersistence(vacancy: Vacancy) {
        return {
            id: vacancy.id,
            title: vacancy.title,
            description: vacancy.description,
            tenantId: vacancy.tenantId,
            recruiterId: vacancy.recruiterId,
            employmentType: vacancy.employmentType,
            workMode: vacancy.workMode,
            closingDate: vacancy.closingDate,
            status: vacancy.status,
            salary: vacancy.salary,
            location: vacancy.location,
            createdAt: vacancy.createdAt,
            updatedAt: vacancy.updatedAt,
            deletedAt: vacancy.deletedAt,
        };
    }

    public static toDomain() {
        throw new Error(MESSAGES.METHOD_NOT_IMPLEMENTED);
    }
}
