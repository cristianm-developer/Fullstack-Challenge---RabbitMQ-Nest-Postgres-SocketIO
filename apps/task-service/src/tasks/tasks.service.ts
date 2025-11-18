import {
    Injectable,
    NotFoundException,
    Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Task } from './entities/task.entity';
import { TaskLog } from './entities/task-log.entity';
import { RelUserTask } from './entities/rel-user-task';
import { Auth } from '../auth/entities/auth.entity';
import { TaskPriority, TaskStatus } from './enum/tasks.enum';

interface CreateTaskDto {
    title: string;
    description?: string;
    prazo?: Date;
    priority?: TaskPriority;
    userIds: number[];
}

interface UpdateTaskDto {
    id: number;
    title?: string;
    description?: string;
    prazo?: Date;
    priority?: TaskPriority;
    status?: TaskStatus;
    userId?: number;
}

interface FindAllFilters {
    status?: TaskStatus;
    priority?: TaskPriority;
    userId?: number;
}

interface AddLogDto {
    taskId: number;
    userId: number;
    change: string;
}

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(TaskLog)
        private readonly taskLogRepository: Repository<TaskLog>,
        @InjectRepository(RelUserTask)
        private readonly relUserTaskRepository: Repository<RelUserTask>,
        @InjectRepository(Auth)
        private readonly authRepository: Repository<Auth>,
        @Inject('TASKS_QUEUE')
        private readonly tasksQueueClient: ClientProxy,
        @Inject('WS_NOTIFICATIONS_QUEUE')
        private readonly wsNotificationsQueueClient: ClientProxy,
        private readonly configService: ConfigService,
    ) {}

    async create(createTaskDto: CreateTaskDto) {
        const task = this.taskRepository.create({
            title: createTaskDto.title,
            description: createTaskDto.description,
            prazo: createTaskDto.prazo,
            priority: createTaskDto.priority || TaskPriority.MEDIUM,
            status: TaskStatus.TODO,
        });

        const savedTask = await this.taskRepository.save(task);

        // Assign users to task
        if (createTaskDto.userIds && createTaskDto.userIds.length > 0) {
            for (const userId of createTaskDto.userIds) {
                const user = await this.authRepository.findOne({
                    where: { id: userId },
                });

                if (user) {
                    const relUserTask = this.relUserTaskRepository.create({
                        taskId: savedTask.id,
                        userId: user.id,
                    });
                    await this.relUserTaskRepository.save(relUserTask);
                }
            }
        }

        // Send message to tasks_queue
        const firstUserId = createTaskDto.userIds && createTaskDto.userIds.length > 0 
            ? createTaskDto.userIds[0] 
            : null;
        
        this.tasksQueueClient.emit('task update', {
            taskId: savedTask.id,
            action: 'created',
            task: savedTask,
            userId: firstUserId,
        });

        return { message: 'Tarefa criada com sucesso' };
    }

    async update(updateTaskDto: UpdateTaskDto) {
        const task = await this.taskRepository.findOne({
            where: { id: updateTaskDto.id },
        });

        if (!task) {
            throw new NotFoundException('A tarefa nao existe.');
        }

        if (updateTaskDto.title !== undefined) {
            task.title = updateTaskDto.title;
        }
        if (updateTaskDto.description !== undefined) {
            task.description = updateTaskDto.description;
        }
        if (updateTaskDto.prazo !== undefined) {
            task.prazo = updateTaskDto.prazo;
        }
        if (updateTaskDto.priority !== undefined) {
            task.priority = updateTaskDto.priority;
        }
        if (updateTaskDto.status !== undefined) {
            task.status = updateTaskDto.status;
        }

        const updatedTask = await this.taskRepository.save(task);

        // Get userId from DTO or try to get from task's assigned users
        let userId: number | undefined = updateTaskDto.userId;
        if (!userId) {
            const userTasks = await this.relUserTaskRepository.find({
                where: { taskId: updatedTask.id },
                take: 1,
            });
            userId = userTasks.length > 0 && userTasks[0] ? userTasks[0].userId : undefined;
        }

        // Send message to tasks_queue
        this.tasksQueueClient.emit('task update', {
            taskId: updatedTask.id,
            action: 'updated',
            task: updatedTask,
            userId: userId,
        });

        return { message: 'Tarefa atualizada com sucesso' };
    }

    async findOne(id: number) {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: [
                'userTasks',
                'userTasks.user',
                'comments',
                'auditLogs',
            ],
        });

        if (!task) {
            throw new NotFoundException('A tarefa nao existe.');
        }

        return task;
    }

    async findAll(filters: FindAllFilters = {}) {
        if (filters.userId) {
            const relUserTasks = await this.relUserTaskRepository.find({
                where: { userId: filters.userId },
                relations: [
                    'task',
                    'task.userTasks',
                    'task.userTasks.user',
                    'task.comments',
                    'task.auditLogs',
                ],
            });

            let tasks = relUserTasks.map((rel) => rel.task);

            // Apply additional filters
            if (filters.status) {
                tasks = tasks.filter((task) => task.status === filters.status);
            }
            if (filters.priority) {
                tasks = tasks.filter(
                    (task) => task.priority === filters.priority,
                );
            }

            return tasks;
        }

        const where: any = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.priority) {
            where.priority = filters.priority;
        }

        return await this.taskRepository.find({
            where,
            relations: [
                'userTasks',
                'userTasks.user',
                'comments',
                'auditLogs',
            ],
        });
    }

    async addLog(logDto: AddLogDto) {
        const task = await this.taskRepository.findOne({
            where: { id: logDto.taskId },
        });

        if (!task) {
            throw new NotFoundException('A tarefa nao existe.');
        }

        const user = await this.authRepository.findOne({
            where: { id: logDto.userId },
        });

        if (!user) {
            throw new NotFoundException('O usuario nao existe.');
        }

        const taskLog = this.taskLogRepository.create({
            taskId: logDto.taskId,
            userId: logDto.userId,
            change: logDto.change,
        });

        const savedLog = await this.taskLogRepository.save(taskLog);

        // Send message to ws_notifications_queue
        this.wsNotificationsQueueClient.emit('notification', {
            taskId: logDto.taskId,
            userId: logDto.userId,
            change: logDto.change,
            logId: savedLog.id,
        });

        return savedLog;
    }
}

