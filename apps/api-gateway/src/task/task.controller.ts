import { Body, Controller, Get, Param, Post, Put, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { FindAllFilters } from './dto/find-all-filters.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '@repo/types';
import { PaginationDto } from './dto/pagination-dto';
import { TaskListResponseDto, TaskResponseDto, TaskResponseItemDto } from './dto/task-response-dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Tarefas')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Post()
    @ApiOperation({ summary: 'Criar nova tarefa', description: 'Cria uma nova tarefa no sistema' })
    @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso', type: TaskResponseDto })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    async create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: JwtPayload) {
        const taskData = {
            ...createTaskDto,
            createdBy: user.sub
        };
        const taskResponse = await this.taskService.create(taskData);
        return plainToInstance(TaskResponseDto, taskResponse);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar tarefa', description: 'Atualiza os dados de uma tarefa existente' })
    @ApiResponse({ status: 200, description: 'Tarefa atualizada com sucesso', type: TaskResponseDto })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateTaskDto: CreateTaskDto, @CurrentUser() user: JwtPayload) {    
        const taskResponse = await this.taskService.update({
            task: updateTaskDto,
            updatedBy: user.sub,
            taskId: id,
        });
        return plainToInstance(TaskResponseDto, taskResponse);
    }

    @Get()
    @ApiOperation({ summary: 'Listar tarefas', description: 'Retorna uma lista de tarefas com filtros opcionais' })
    @ApiResponse({ status: 200, description: 'Lista de tarefas retornada com sucesso' })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    @ApiResponse({ status: 200, description: 'Lista de tarefas retornada com sucesso', type: TaskListResponseDto })
    async findAll(@Query() filters?: FindAllFilters) {
        const tasksResponse = await this.taskService.findAll(filters);
        return plainToInstance(TaskListResponseDto, tasksResponse);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar tarefa por ID', description: 'Retorna os detalhes de uma tarefa específica' })
    @ApiParam({ name: 'id', description: 'ID da tarefa', type: Number, example: 1 })
    @ApiResponse({ status: 200, description: 'Tarefa encontrada com sucesso', type: TaskResponseDto })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const taskResponse = await this.taskService.findOne(id);
        return plainToInstance(TaskResponseItemDto, taskResponse);
    }

    @Post(':taskId/comments')
    @ApiOperation({ summary: 'Criar comentário', description: 'Adiciona um comentário a uma tarefa' })
    @ApiResponse({ status: 201, description: 'Comentário criado com sucesso' })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
    async createComment(@Param('taskId', ParseIntPipe) taskId: number, @Body() createCommentDto: CreateCommentDto, @CurrentUser() user: JwtPayload) {
        const commentData = {
            ...createCommentDto,
            userId: user.sub,            
            taskId: taskId,
        };
        return this.taskService.createComment(commentData);
    }

    @Get(':taskId/comments')
    @ApiOperation({ summary: 'Listar comentários da tarefa', description: 'Retorna todos os comentários de uma tarefa específica' })
    @ApiParam({ name: 'taskId', description: 'ID da tarefa', type: Number, example: 1 })
    @ApiResponse({ status: 200, description: 'Lista de comentários retornada com sucesso' })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
    async findAllComments(@Param('taskId', ParseIntPipe) taskId: number, @Query() pagination: PaginationDto) {
        return this.taskService.findAllComments(taskId, pagination);
    }
}
