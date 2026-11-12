// import { ApiProperty } from "@nestjs/swagger";

import { PaginationQueryDto } from "@/shared/pagination";

// import { CompanyResponseDto } from "./response";

export class ListCompaniesQueryDto extends PaginationQueryDto {}

// export class ListCompaniesResponseDto {
//     @ApiProperty({
//         type: [CompanyResponseDto],
//         description: "List of companies.",
//     })
//     companies!: CompanyResponseDto[];

//     @ApiProperty({
//         description: "Pagination metadata.",
//     })
//     meta!: unknown;
// }
