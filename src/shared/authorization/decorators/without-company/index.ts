import { SetMetadata } from "@nestjs/common";

export const WITHOUT_COMPANY_KEY = "without_company";
export const WithoutCompany = () => SetMetadata(WITHOUT_COMPANY_KEY, true);
