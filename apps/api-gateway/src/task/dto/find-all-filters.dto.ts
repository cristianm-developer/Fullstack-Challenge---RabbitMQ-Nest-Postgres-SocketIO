import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min, MaxLength, IsArray } from 'class-validator';
import { TaskPriority, TaskStatus } from '@repo/types';
import { Transform, Type } from 'class-transformer';

export class FindAllFilters {
    @ApiProperty({
        description: 'Filtrar tarefas por título (busca parcial)',
        example: 'autenticação',
        required: false,
        maxLength: 100,
    })
    @IsOptional()
    @IsString({ message: 'O título deve ser uma string' })
    @MaxLength(100, { message: 'O título de busca deve ter no máximo 100 caracteres' })
    title?: string;

    @ApiProperty({
        description: 'Filtrar tarefas por status',
        example: TaskStatus.IN_PROGRESS,
        enum: TaskStatus,
        required: false,
    })
    @IsOptional()
    @IsEnum(TaskStatus, { message: 'O status deve ser TODO, IN_PROGRESS, REVIEW ou DONE' })
    status?: TaskStatus;

    @ApiProperty({
        description: 'Filtrar tarefas por prioridade',
        example: TaskPriority.HIGH,
        enum: TaskPriority,
        required: false,
    })
    @IsOptional()
    @IsEnum(TaskPriority, { message: 'A prioridade deve ser LOW, MEDIUM, HIGH ou URGENT' })
    priority?: TaskPriority;

    @ApiProperty({
        description: 'Filtrar tarefas por ID do usuário',
        example: 1,
        required: false,
        type: Number
    })
    @IsOptional()
    @Transform(({value}) => {
        if(!value) return undefined;

        if(Array.isArray(value)) {
            return value.map(v => typeof v === 'string' ? parseInt(v, 10) : Number(v))
        } else {
            const num = parseInt(value, 10);
            return [num]
        }

    })
    @IsArray({ message: 'Os IDs dos usuários devem ser um array' })
    @IsInt({ each: true, message: 'O ID do usuário deve ser um número inteiro' })
    @Min(1, { each: true, message: 'O ID do usuário deve ser maior que zero' })
    userIds?: number[];

    @ApiProperty({
        description: 'Página da paginação',
        example: 1,
        required: false,
        minimum: 1,
    })
    @Type(() => Number)
    @IsInt({ message: 'A página deve ser um número inteiro' })
    @Min(1, { message: 'A página deve ser maior que zero' })
    page?: number;

    @ApiProperty({
        description: 'Limite de itens por página (paginação)',
        example: 10,
        required: false,
        minimum: 1,
    })
    @Type(() => Number)
    @IsInt({ message: 'O limite deve ser um número inteiro' })
    @Min(1, { message: 'O limite deve ser maior que zero' })
    limit?: number;
}

