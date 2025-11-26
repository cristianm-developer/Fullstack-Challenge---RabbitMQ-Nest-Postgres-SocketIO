import { PaginationDto } from "./pagination";
import { TaskPriority, TaskStatus } from "./tasks.enum";

export class TaskDto {  
    id!: number;
    title!: string;
    description?: string;
    deadline?: Date;
    priority!: TaskPriority;
    status!: TaskStatus;
    userIds!: number[];
    createdAt!: Date;
}
export class CreateTaskDto {
    createdBy?: number;
    title?: string;
    description?: string;
    deadline?: Date;
    priority?: TaskPriority;
    status?: TaskStatus;
    userIds?: number[];
}

export class UpdateTaskWrapper {
    task!: UpdateTaskDto;
    updatedBy!: number;
    taskId!: number;
}

export class UpdateTaskDto {
    createdBy?: number;
    title?: string;
    description?: string;
    deadline?: Date;
    priority?: TaskPriority;
    status?: TaskStatus;
    userIds?: number[];
}

export class FindAllFilters extends PaginationDto {
    title?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    userIds?: number[];
}

export class AddLogDto {
    taskId!: number;
    userId!: number;
    change!: string;
}

