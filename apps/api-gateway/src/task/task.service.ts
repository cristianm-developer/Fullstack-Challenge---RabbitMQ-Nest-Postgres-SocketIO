import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { 
    CreateTaskDto as CreateTaskDtoType, 
    FindAllFilters as FindAllFiltersType, 
    TASK_PATTERNS, 
    UpdateTaskDto as UpdateTaskDtoType,
    CreateCommentDto as CreateCommentDtoType,
    COMMENT_PATTERNS,
    AddLogDto as AddLogDtoType,
    TaskPriority,
    UpdateTaskWrapper,
} from '@repo/types';
import { firstValueFrom } from 'rxjs';
import { FindAllFilters } from './dto/find-all-filters.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginationDto } from './dto/pagination-dto';

@Injectable()
export class TaskService {
    constructor(
        @Inject('TASK_CLIENT')
        private readonly taskClient: ClientProxy,
    ) {}

    async create(createTaskDto: CreateTaskDtoType) {    
        return await firstValueFrom(
            this.taskClient.send(TASK_PATTERNS.CREATE_TASK, createTaskDto)
        );
    }

    async update(data: UpdateTaskWrapper) {
        return await firstValueFrom(
            this.taskClient.send(TASK_PATTERNS.UPDATE_TASK, data)
        );
    }

    async findAll(filters?: FindAllFilters) {
        return await firstValueFrom(
            this.taskClient.send(TASK_PATTERNS.FIND_ALL_TASKS, filters)
        );
    }

    async findOne(id: number) {
        return await firstValueFrom(
            this.taskClient.send(TASK_PATTERNS.FIND_ONE_TASK, {id})
        );
    }

    async createComment(createCommentDto: CreateCommentDto ){
        
        return await firstValueFrom(
            this.taskClient.send(COMMENT_PATTERNS.CREATE_COMMENT, createCommentDto)
        );
    }

    async findAllComments(taskId: number, pagination: PaginationDto) {
        return await firstValueFrom(
            this.taskClient.send(COMMENT_PATTERNS.FIND_ALL_COMMENTS, {taskId, ...pagination})
        );
    }

    async addLog(logDto: AddLogDtoType) {
        return await firstValueFrom(
            this.taskClient.send(TASK_PATTERNS.ADD_TASK_LOG, logDto)
        );
    }
}
