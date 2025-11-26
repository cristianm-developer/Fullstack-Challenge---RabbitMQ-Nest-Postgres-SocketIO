import {
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Task } from './entities/task.entity';
import { TaskLog } from './entities/task-log.entity';
import { RelUserTask } from './entities/rel-user-task.entity';
import { AddLogDto, CreateTaskDto, FindAllFilters, ResponseDto, TASK_PATTERNS, TaskPriority, TaskStatus, UpdateTaskDto, UpdateTaskWrapper, WS_NOTIFICATIONS } from '@repo/types';
import { NotificationsService } from '../notifications/notifications.service';
import { filter } from 'rxjs';



@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(TaskLog)
        private readonly taskLogRepository: Repository<TaskLog>,
        @InjectRepository(RelUserTask)
        private readonly relUserTaskRepository: Repository<RelUserTask>,
        @Inject('TASK_SERVICE')
        private readonly taskClient: ClientProxy,
        private readonly notificationsService: NotificationsService,
    ) {}

    async create(createTaskDto: CreateTaskDto): Promise<ResponseDto<Task>> {
        const task = this.taskRepository.create({
            title: createTaskDto.title,
            description: createTaskDto.description,
            deadline: createTaskDto.deadline,
            status: TaskStatus.TODO,
            createdBy: createTaskDto.createdBy,
            priority: createTaskDto.priority ?? TaskPriority.MEDIUM as any,
        });

        const savedTask = await this.taskRepository.save(task);

        if (createTaskDto.userIds && createTaskDto.userIds.length > 0) {
            for (const userId of createTaskDto.userIds) {
                const relUserTask = this.relUserTaskRepository.create({
                    taskId: savedTask.id,
                    userId: userId,
                });
                await this.relUserTaskRepository.save(relUserTask);
            }
        }

        this.taskClient.emit(TASK_PATTERNS.ADD_TASK_LOG, {
            taskId: savedTask.id,
            userId: savedTask.createdBy,
            change: `Tarefa criada: ${savedTask.title}, data: ${JSON.stringify(savedTask)}`,
        });

        this.notificationsService.handleNotification({
            message: `Voce foi adicionado a uma nova tarefa: ${savedTask.title}`,
            title: 'Nova tarefa',
            type: 'INFO',
            createdBy: savedTask.createdBy,
            userIds: createTaskDto.userIds?.map(id => id.toString()) ?? [],
            data: { id: savedTask.id },
            event: WS_NOTIFICATIONS.taskCreated,
        });

        return { message: 'Tarefa criada com sucesso', data: savedTask };
    }

    async update(updateTaskDto: UpdateTaskWrapper) {
        const task = await this.taskRepository.findOne({
            where: { id: updateTaskDto.taskId },
            relations: [ 'userTasks' ],
        });

        if (!task) {
            throw new NotFoundException('A tarefa nao existe.');
        }

        if(task.createdBy !== updateTaskDto.updatedBy) {
            throw new ForbiddenException('Voce nao tem permissao para atualizar esta tarefa.');
        }

        task.title = updateTaskDto.task.title ?? task.title;
        task.description = updateTaskDto.task.description ?? task.description;
        task.deadline = updateTaskDto.task.deadline ?? task.deadline;
        task.priority = updateTaskDto.task.priority ?? task.priority as any;
        task.status = updateTaskDto.task.status ?? task.status as any;
        let usersToAdd: number[] = [];
        let usersToRemove: number[] = [];

        if(updateTaskDto.task.userIds !== undefined) {
            const currentUsers = task.userTasks.map(ut => ut.userId);
            const incomingUsers = updateTaskDto.task.userIds;

            usersToAdd = incomingUsers.filter(id => !currentUsers.includes(id));
            usersToRemove = currentUsers.filter(id => !incomingUsers.includes(id));

            if(usersToRemove.length > 0) {
                const usersRelToRemove = task.userTasks.filter(ut => usersToRemove.includes(ut.userId));
                usersRelToRemove.forEach(async (ut) => {
                    await this.relUserTaskRepository.remove(ut);
                });
                task.userTasks = task.userTasks.filter(ut => !usersToRemove.includes(ut.userId));                
            }

            if(usersToAdd.length > 0) {                
                const newUserTasks =  usersToAdd.map(userId => this.relUserTaskRepository.create({
                    taskId: task.id,
                    userId: userId,
                }));
                await this.relUserTaskRepository.save(newUserTasks);
                task.userTasks = [...task.userTasks, ...newUserTasks];
            }

        }

        const updatedTask = await this.taskRepository.save(task);

        const changes = {
            title: updateTaskDto.task.title !== undefined ? `Título: ${updateTaskDto.task.title}` : null,
            description: updateTaskDto.task.description !== undefined ? `Descrição: ${updateTaskDto.task.description}` : null,
            deadline: updateTaskDto.task.deadline !== undefined ? `Prazo: ${updateTaskDto.task.deadline}` : null,
            priority: updateTaskDto.task.priority !== undefined ? `Prioridade: ${updateTaskDto.task.priority}` : null,
            status: updateTaskDto.task.status !== undefined ? `Status: ${updateTaskDto.task .status}` : null,
            users: usersToAdd.length > 0 || usersToRemove.length > 0 ? `Usuários Add/Remove: ${usersToAdd.join(', ')} ${usersToRemove.length > 0 ? `- ${usersToRemove.join(', ')}` : ''}` : null,
        }

        this.taskClient.emit(TASK_PATTERNS.ADD_TASK_LOG, {
            taskId: updatedTask.id,
            userId: updatedTask.createdBy,
            change: `Tarefa atualizada: ${updatedTask.title}, data: ${JSON.stringify(changes)}`,
        });

        this.notificationsService.handleNotification({
            message: `Uma tarefa que voce esta participando foi atualizada: ${updatedTask.title}`,
            data: { id: updatedTask.id },
            title: 'Tarefa atualizada',
            createdBy: updatedTask.createdBy,
            type: 'INFO',
            userIds: usersToAdd.map(id => id.toString()),
            event: WS_NOTIFICATIONS.taskUpdated,
        });

        return { message: 'Tarefa atualizada com sucesso', data: task };
    }

    async findOne(id: number) {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: [
                'userTasks'
            ],
        });

        if (!task) {
            throw new NotFoundException('A tarefa nao existe.');
        }

        return task;
    }

    async findAll(filters: FindAllFilters = { page: 1, limit: 10 }) {
        const page = filters.page ? Number(filters.page) : 1;
        const limit = filters.limit ? Number(filters.limit) : 10;
        const skip = (page - 1) * limit;

        const queryBuilder = this.taskRepository.createQueryBuilder('tasks');
        queryBuilder.orderBy('tasks.createdAt', 'DESC');
        queryBuilder.skip(skip);
        queryBuilder.take(limit);

        filters.userIds && filters.userIds.length && queryBuilder.andWhere('tasks.createdBy IN (:...userIds)', { userIds: filters.userIds});
        filters.status && queryBuilder.andWhere('tasks.status = :status', { status: filters.status });
        filters.priority && queryBuilder.andWhere('tasks.priority = :priority', { priority: filters.priority });
        filters.title && queryBuilder.andWhere('tasks.title LIKE :title', { title: `%${filters.title}%` });

        const [tasks, total] = await queryBuilder.getManyAndCount();

        return {
            message: 'Lista de tarefas encontrada com sucesso',
            data: tasks,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        }

    }

    async addLog(logDto: AddLogDto) {
        const task = await this.taskRepository.findOne({
            where: { id: logDto.taskId },
        });

        if (!task) {
            throw new NotFoundException('A tarefa nao existe.');
        }

        const taskLog = this.taskLogRepository.create({
            taskId: logDto.taskId,
            userId: logDto.userId,
            change: logDto.change,
        });

        const savedLog = await this.taskLogRepository.save(taskLog);

        return savedLog;
    }
}

