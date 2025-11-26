import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, ArrayMinSize } from 'class-validator';
import { TaskPriority, TaskStatus } from '@repo/types';

export class CreateTaskDto {
    @ApiProperty({
        description: 'Título da tarefa',
        example: 'Implementar autenticação',
        required: true,
        maxLength: 255,
    })
    @IsNotEmpty({ message: 'O título é obrigatório' })
    @IsString({ message: 'O título deve ser uma string' })
    @MaxLength(255, { message: 'O título deve ter no máximo 255 caracteres' })
    title!: string;

    @ApiProperty({
        description: 'Descrição detalhada da tarefa',
        example: 'Implementar sistema de autenticação com JWT',
        required: false,
        maxLength: 2000,
    })
    @IsOptional()
    @IsString({ message: 'A descrição deve ser uma string' })
    @MaxLength(2000, { message: 'A descrição deve ter no máximo 2000 caracteres' })
    description?: string;

    @ApiProperty({
        description: 'Data de prazo da tarefa',
        example: '2024-12-31T23:59:59Z',
        required: false,
    })
    @IsOptional()
    @IsDateString({}, { message: 'O prazo deve ser uma data válida no formato ISO' })
    prazo?: Date;

    @ApiProperty({
        description: 'Prioridade da tarefa',
        example: TaskPriority.MEDIUM,
        enum: TaskPriority,
        required: false,
        default: TaskPriority.MEDIUM,
    })
    @IsEnum(TaskPriority, { message: 'A prioridade deve ser LOW, MEDIUM, HIGH ou URGENT' })
    priority!: TaskPriority;

    @ApiProperty({
        description: 'Lista de IDs dos usuários atribuídos à tarefa',
        example: [1, 2, 3],
        required: true,
        type: [Number],
    })
    @IsNotEmpty({ message: 'A lista de usuários é obrigatória' })
    @IsArray({ message: 'Os IDs dos usuários devem ser um array' })
    @ArrayMinSize(1, { message: 'Deve haver pelo menos um usuário atribuído' })
    @IsInt({ each: true, message: 'Cada ID de usuário deve ser um número inteiro' })
    @Min(1, { each: true, message: 'Cada ID de usuário deve ser maior que zero' })
    userIds!: number[];

    @ApiProperty({
        description: 'Prazo da tarefa',
        example: '2024-12-31',
        required: false,
        type: String,
    })
    @IsDateString({}, { message: 'O prazo deve ser uma data válida (formato ISO 8601)' })
    deadline?: Date;

    @ApiProperty({
        description: 'Status da tarefa',
        example: 'TODO',
        enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'],
        required: false,
        default: 'TODO',
        type: String,
    })
    @IsEnum(TaskStatus, { message: 'O status deve ser TODO, IN_PROGRESS, REVIEW ou DONE' })
    status!: TaskStatus;
}

