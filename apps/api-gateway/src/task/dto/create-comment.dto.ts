import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min, MaxLength } from 'class-validator';

export class CreateCommentDto {
    @ApiProperty({
        description: 'Conteúdo do comentário',
        example: 'Esta tarefa está progredindo bem!',
        required: true,
        maxLength: 1000,
    })
    @IsNotEmpty({ message: 'O conteúdo do comentário é obrigatório' })
    @IsString({ message: 'O conteúdo do comentário deve ser uma string' })
    @MaxLength(1000, { message: 'O conteúdo do comentário deve ter no máximo 1000 caracteres' })
    content!: string;
    
}

