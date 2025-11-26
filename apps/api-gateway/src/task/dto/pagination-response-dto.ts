import { ApiProperty } from "@nestjs/swagger";

export class PaginationResponseMetaDto {

    @ApiProperty({
        description: 'Total de itens disponíveis',
        example: 100,
    })
    totalItems!: number;

    @ApiProperty({
        description: 'Quantidade de itens retornados nesta página',
        example: 10,
    })
    itemsCount!: number;

    @ApiProperty({
        description: 'Total de páginas disponíveis',
        example: 10,
    })
    totalPages!: number;

    @ApiProperty({
        description: 'Página atual',
        example: 1,
    })
    currentPage!: number;
}