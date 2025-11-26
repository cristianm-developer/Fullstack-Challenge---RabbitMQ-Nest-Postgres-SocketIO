import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '@repo/types';
import { Exclude, Expose, Transform } from 'class-transformer';
import { PaginationResponseMetaDto } from './pagination-response-dto';
import { ECDH } from 'crypto';

@Exclude()
export class TaskListedResponseDto {
  @ApiProperty({
    description: 'ID único da tarefa',
    example: 1,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Título da tarefa',
    example: 'Implementar autenticação',
  })
  @Expose()
  title!: string;

  @ApiProperty({
    description: 'Prazo da tarefa',
    example: '2024-10-15T23:59:59.000Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  @Transform(
    ({ value }) => (value instanceof Date ? value.toISOString() : value),
    { toPlainOnly: true },
  )
  deadline!: Date;

  @ApiProperty({
    description: 'Prioridade da tarefa',
    example: TaskPriority.MEDIUM,
    enum: TaskPriority,
  })
  @Expose()
  priority!: TaskPriority;

  @ApiProperty({
    description: 'Status da tarefa',
    example: TaskStatus.TODO,
    enum: TaskStatus,
  })
  @Expose()
  status!: TaskStatus;
}

@Exclude()
export class TaskListResponseDto {
  @ApiProperty({
    description: 'Dados da lista de tarefas',
    type: [TaskListedResponseDto],
  })
  @Expose()
  @Transform(
    ({ value }) =>
      Array.isArray(value)
        ? value.map((item) =>
            item instanceof TaskListedResponseDto
              ? item
              : Object.assign(new TaskListedResponseDto(), item),
          )
        : value,
    { toClassOnly: true },
  )
  data!: TaskListedResponseDto[];

  @ApiProperty({
    description: 'Metadados da paginação',
    type: PaginationResponseMetaDto,
  })
  @Expose()
  @Transform(
    ({ value }) =>
      value instanceof PaginationResponseMetaDto
        ? value
        : Object.assign(new PaginationResponseMetaDto(), value),
    { toClassOnly: true },
  )
  meta!: PaginationResponseMetaDto;
}

@Exclude()
export class TaskResponseItemDto {
  @ApiProperty({
    description: 'ID da tarefa',
    example: 1,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Título da tarefa',
    example: 'Implementar autenticação',
  })
  @Expose()
  title!: string;

  @ApiProperty({
    description: 'Descrição da tarefa',
    example: 'Implementar autenticação utilizando JWT',
    required: false,
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Data de prazo da tarefa',
    example: '2024-12-31T23:59:59Z',
  })
  @Expose()
  deadline!: Date;

  @ApiProperty({
    description: 'Prioridade da tarefa',
    example: TaskPriority.MEDIUM,
    enum: TaskPriority,
  })
  @Expose()
  priority!: TaskPriority;

  @ApiProperty({
    description: 'Status da tarefa',
    example: TaskStatus.TODO,
    enum: TaskStatus,
  })
  @Expose()
  status!: TaskStatus;

  @ApiProperty({
    description: 'Data de criação da tarefa',
    example: '2024-01-01T12:34:56Z',
  })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    description: 'Lista de IDs dos usuários atribuídos à tarefa',
    example: [1, 2, 3],
    type: [Number],
  })
  @Expose()
  createdBy!: number;

  @Transform(({ value }) => value, { toClassOnly: true })
  private _userTasks!: { userId: number }[];

  @Expose()
  @Transform(
    ({ obj }) => obj.userTasks?.map((t: { userId: number }) => t.userId) ?? [],
    { toClassOnly: true },
  )
  userIds!: number[];
}

@Exclude()
export class TaskResponseDto {
  @ApiProperty({
    description: 'Dados da tarefa',
    type: TaskResponseItemDto,
  })
  @Expose()
  data!: TaskResponseItemDto;
  @ApiProperty({
    description: 'Mensagem de status da operação',
    example: 'Tarefa encontrada com sucesso',
  })
  @Expose()
  message!: string;
}
