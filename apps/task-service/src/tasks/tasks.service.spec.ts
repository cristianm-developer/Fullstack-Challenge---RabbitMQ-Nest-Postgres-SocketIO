import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { TaskLog } from './entities/task-log.entity';
import { RelUserTask } from './entities/rel-user-task.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, TaskPriority, TaskStatus } from '@repo/types';
import { emit } from 'process';
import { NotificationsService } from '../notifications/notifications.service';

const mockTaskRepository = {
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    findOneByOrFail: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    }),
    getManyAndCount: jest.fn(),
};

const mockTaskLogRepository = {
    save: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
};

const mockRelUserTaskRepository = {
    save: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
};

const mockNotificationsService = {
    handleNotification: jest.fn(),
};

describe('TasksService', () => {
    let service: TasksService;
    let taskRepository: Repository<Task>;
    let taskLogRepository: Repository<TaskLog>;
    let relUserTaskRepository: Repository<RelUserTask>;

    const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        prazo: new Date('2024-12-31'),
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        createdBy: 1,
        userTasks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUser = {
        id: 1,
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockTaskClient = {
        emit: jest.fn().mockReturnValue({
            toPromise: jest.fn().mockResolvedValue(true),
        }),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                {
                    provide: 'TASK_SERVICE',
                    useValue: mockTaskClient,
                },
                {
                    provide: getRepositoryToken(Task),
                    useValue: mockTaskRepository,
                },
                {
                    provide: getRepositoryToken(TaskLog),
                    useValue: mockTaskLogRepository,
                },
                {
                    provide: getRepositoryToken(RelUserTask),
                    useValue: mockRelUserTaskRepository,
                },
                {
                    provide: NotificationsService,
                    useValue: mockNotificationsService,
                },
            ],
        }).compile();

        service = module.get<TasksService>(TasksService);
        taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
        taskLogRepository = module.get<Repository<TaskLog>>(
            getRepositoryToken(TaskLog),
        );
        relUserTaskRepository = module.get<Repository<RelUserTask>>(
            getRepositoryToken(RelUserTask),
        );

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {

        it('should be defined', () => {
            expect(service.create).toBeDefined();
        });


        it('should create a task successfully and return success message', async () => {
            const createTaskDto: CreateTaskDto = {
                title: 'New Task',
                description: 'Task Description',
                deadline: new Date('2024-12-31'),
                priority: TaskPriority.HIGH,
                userIds: [1],
                createdBy: 1,
            };

            mockTaskRepository.create.mockReturnValue({
                ...createTaskDto,
                status: TaskStatus.TODO,
            });
            mockTaskRepository.save.mockResolvedValue({
                id: 1,
                ...createTaskDto,
                status: TaskStatus.TODO,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            mockRelUserTaskRepository.create.mockReturnValue({
                taskId: 1,
                userId: 1,
            });
            mockRelUserTaskRepository.save.mockResolvedValue({
                id: 1,
                taskId: 1,
                userId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await service.create(createTaskDto);

            expect(taskRepository.create).toHaveBeenCalled();
            expect(taskRepository.save).toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result.message).toBe('Tarefa criada com sucesso');
            expect(result.data?.id).toBeDefined();
        });

        it('should create a task with default priority and status', async () => {
            const createTaskDto = {
                title: 'New Task',
                userIds: [1],
                creatorId: 1,
            };

            mockTaskRepository.create.mockReturnValue({
                ...createTaskDto,
                priority: TaskPriority.MEDIUM,
                status: TaskStatus.TODO,
            });
            mockTaskRepository.save.mockResolvedValue({
                id: 1,
                ...createTaskDto,
                priority: TaskPriority.MEDIUM,
                status: TaskStatus.TODO,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            mockRelUserTaskRepository.create.mockReturnValue({
                taskId: 1,
                userId: 1,
            });
            mockRelUserTaskRepository.save.mockResolvedValue({
                id: 1,
                taskId: 1,
                userId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await service.create(createTaskDto);

            expect(result.message).toBe('Tarefa criada com sucesso');
        });
    });

    describe('update', () => {

        it('should be defined', () => {
            expect(service.update).toBeDefined();
        });

        it('should update a task successfully and return success message', async () => {
            const updateTaskDto = {
                taskId: 1,
                updatedBy: 1,
                task: {
                    title: 'Updated Task',
                    description: 'Updated Description',
                    status: TaskStatus.IN_PROGRESS,
                },
            };

            const updatedTask = {
                ...mockTask,
                title: 'Updated Task',
                description: 'Updated Description',
                status: TaskStatus.IN_PROGRESS,
            };

            mockTaskRepository.findOne.mockResolvedValue(mockTask);
            mockTaskRepository.save.mockResolvedValue(updatedTask);

            const result = await service.update(updateTaskDto);

            expect(taskRepository.findOne).toHaveBeenCalledWith({
                where: { id: updateTaskDto.taskId },
                relations: ['userTasks'],
            });
            expect(taskRepository.save).toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result.message).toBe('Tarefa atualizada com sucesso');
            expect(result.data.title).toBe('Updated Task');
        });

        it('should throw an error with portuguese message if task does not exist', async () => {
            const updateTaskDto = {
                taskId: 999,
                updatedBy: 1,
                task: {
                    title: 'Updated Task',
                },
            };

            mockTaskRepository.findOne.mockResolvedValue(null);

            await expect(service.update(updateTaskDto)).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.update(updateTaskDto)).rejects.toThrow(
                'A tarefa nao existe.',
            );
        });

        it('should update only provided fields and return success message', async () => {
            const updateTaskDto = {
                taskId: 1,
                updatedBy: 1,
                task: {
                    status: TaskStatus.DONE,
                },
            };

            const updatedTask = {
                ...mockTask,
                status: TaskStatus.DONE,
            };

            mockTaskRepository.findOne.mockResolvedValue(mockTask);
            mockTaskRepository.save.mockResolvedValue(updatedTask);

            const result = await service.update(updateTaskDto);

            expect(result.message).toBe('Tarefa atualizada com sucesso');
            expect(result.data.status).toBe(TaskStatus.DONE);
        });
    });

    describe('findOne', () => {
        it('should find a task by id', async () => {
            mockTaskRepository.findOne.mockResolvedValue(mockTask);

            const result = await service.findOne(1);

            expect(taskRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['userTasks'],
            });
            expect(result).toBeDefined();
            expect(result.id).toBe(1);
        });

        it('should throw an error with portuguese message if task does not exist', async () => {
            mockTaskRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.findOne(999)).rejects.toThrow(
                'A tarefa nao existe.',
            );
        });
    });

    describe('findAll', () => {
        let mockQueryBuilder: any;

        beforeEach(() => {
            mockQueryBuilder = {
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getManyAndCount: jest.fn(),
            };
            mockTaskRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        });

        it('should find all tasks without filters', async () => {
            const tasks = [mockTask, { ...mockTask, id: 2 }];
            mockQueryBuilder.getManyAndCount.mockResolvedValue([tasks, 2]);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(taskRepository.createQueryBuilder).toHaveBeenCalledWith('tasks');
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('tasks.createdAt', 'DESC');
            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
            expect(result).toBeDefined();
            expect(result.data.length).toBe(2);
            expect(result.meta.total).toBe(2);
        });

        it('should find tasks filtered by status', async () => {
            const tasks = [{ ...mockTask, status: TaskStatus.TODO }];
            mockQueryBuilder.getManyAndCount.mockResolvedValue([tasks, 1]);

            const result = await service.findAll({ status: TaskStatus.TODO, page: 1, limit: 10 });

            expect(taskRepository.createQueryBuilder).toHaveBeenCalledWith('tasks');
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('tasks.status = :status', { status: TaskStatus.TODO });
            expect(result).toBeDefined();
            expect(result.data[0]?.status).toBe(TaskStatus.TODO);
        });

        it('should find tasks filtered by priority', async () => {
            const tasks = [{ ...mockTask, priority: TaskPriority.HIGH }];
            mockQueryBuilder.getManyAndCount.mockResolvedValue([tasks, 1]);

            const result = await service.findAll({ priority: TaskPriority.HIGH, page: 1, limit: 10 });

            expect(taskRepository.createQueryBuilder).toHaveBeenCalledWith('tasks');
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('tasks.priority = :priority', { priority: TaskPriority.HIGH });
            expect(result).toBeDefined();
            expect(result.data[0]?.priority).toBe(TaskPriority.HIGH);
        });

        it('should find tasks filtered by status and priority', async () => {
            const tasks = [
                {
                    ...mockTask,
                    status: TaskStatus.IN_PROGRESS,
                    priority: TaskPriority.URGENT,
                },
            ];
            mockQueryBuilder.getManyAndCount.mockResolvedValue([tasks, 1]);

            const result = await service.findAll({
                status: TaskStatus.IN_PROGRESS,
                priority: TaskPriority.URGENT,
                page: 1,
                limit: 10,
            });

            expect(taskRepository.createQueryBuilder).toHaveBeenCalledWith('tasks');
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('tasks.status = :status', { status: TaskStatus.IN_PROGRESS });
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('tasks.priority = :priority', { priority: TaskPriority.URGENT });
            expect(result).toBeDefined();
            expect(result.data[0]?.status).toBe(TaskStatus.IN_PROGRESS);
            expect(result.data[0]?.priority).toBe(TaskPriority.URGENT);
        });

        it('should find tasks filtered by userId', async () => {
            const tasks = [mockTask];
            mockQueryBuilder.getManyAndCount.mockResolvedValue([tasks, 1]);

            const result = await service.findAll({ userIds: [1], page: 1, limit: 10 });

            expect(taskRepository.createQueryBuilder).toHaveBeenCalledWith('tasks');
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('tasks.createdBy IN (:...userIds)', { userIds: [1] });
            expect(result).toBeDefined();
            expect(result.data.length).toBe(1);
        });
    });

    describe('addLog', () => {
        it('should add a log entry to a task', async () => {
            const logDto = {
                taskId: 1,
                userId: 1,
                change: 'Task status changed from TODO to IN_PROGRESS',
            };

            mockTaskRepository.findOne.mockResolvedValue(mockTask);
            mockTaskLogRepository.create.mockReturnValue({
                ...logDto,
                createdAt: new Date(),
            });
            mockTaskLogRepository.save.mockResolvedValue({
                id: 1,
                ...logDto,
                createdAt: new Date(),
            });

            const result = await service.addLog(logDto);

            expect(taskRepository.findOne).toHaveBeenCalledWith({
                where: { id: logDto.taskId },
            });
      
            expect(taskLogRepository.create).toHaveBeenCalled();
            expect(taskLogRepository.save).toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result.change).toBe(logDto.change);
        });

        it('should throw an error with portuguese message if task does not exist when adding log', async () => {
            const logDto = {
                taskId: 999,
                userId: 1,
                change: 'Some change',
            };

            mockTaskRepository.findOne.mockResolvedValue(null);

            await expect(service.addLog(logDto)).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.addLog(logDto)).rejects.toThrow(
                'A tarefa nao existe.',
            );
        });

    });
});

