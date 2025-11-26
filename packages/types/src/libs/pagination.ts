export class PaginationDto {
    page!: number;
    limit!: number;
}

export class PaginationMeta {
    total!: number;
    limit!: number;
    totalPages!: number;
    page!: number;
}