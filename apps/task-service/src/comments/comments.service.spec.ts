import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { Task } from '../tasks/entities/task.entity';
import { CreateCommentDto } from '@repo/types';
import { NotificationsService } from '../notifications/notifications.service';

const mockQueryBuilder = {
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
};

const mockCommentRepository = {
    save: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

const mockNotificationsService = {
    handleNotification: jest.fn(),
};

const mockTaskRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
};

describe('CommentsService', () => {
    let service: CommentsService;
    let commentRepository: Repository<Comment>;
    let taskRepository: Repository<Task>;

    const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        deadline: new Date('2024-12-31'),
        priority: 'MEDIUM',
        status: 'TODO',
        userId: 1,
        userTasks: [
            { userId: 1, taskId: 1 },
            { userId: 2, taskId: 1 },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockComment = {
        id: 1,
        content: 'Test comment content',
        taskId: 1,
        userId: 1,
        task: mockTask,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockTaskClient = {
        emit: jest.fn().mockReturnValue({
            toPromise: jest.fn().mockResolvedValue(true),
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentsService,
                {
                    provide: getRepositoryToken(Comment),
                    useValue: mockCommentRepository,
                },
                {
                    provide: getRepositoryToken(Task),
                    useValue: mockTaskRepository,
                },
                {
                  provide: 'TASK_SERVICE',
                  useValue: mockTaskClient,
                },
                {
                    provide: NotificationsService,
                    useValue: mockNotificationsService,
                },
              
            ],
        }).compile();

        service = module.get<CommentsService>(CommentsService);
        commentRepository = module.get<Repository<Comment>>(
            getRepositoryToken(Comment),
        );
        taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));

        jest.clearAllMocks();
        mockQueryBuilder.orderBy.mockReturnThis();
        mockQueryBuilder.skip.mockReturnThis();
        mockQueryBuilder.take.mockReturnThis();
        mockQueryBuilder.where.mockReturnThis();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should be defined', () => {
            expect(service.create).toBeDefined();
        });

        it('should create a comment successfully and return success message', async () => {
            const createCommentDto: CreateCommentDto = {
                content: 'New comment content',
                taskId: 1,
                userId: 1,
            };

            mockTaskRepository.findOne.mockResolvedValue(mockTask);
            mockCommentRepository.create.mockReturnValue({
                ...createCommentDto,
            });
            mockCommentRepository.save.mockResolvedValue({
                id: 1,
                ...createCommentDto,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await service.create(createCommentDto);

            expect(taskRepository.findOne).toHaveBeenCalledWith({
                where: { id: createCommentDto.taskId },
                relations: ['userTasks'],
            });
            expect(commentRepository.create).toHaveBeenCalled();
            expect(commentRepository.save).toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result.message).toBe('Comentário criado com sucesso');
            expect(result.data?.id).toBeDefined();
            expect(result.data?.content).toBe(createCommentDto.content);
        });

        it('should throw an error with portuguese message if task does not exist', async () => {
            const createCommentDto: CreateCommentDto = {
                content: 'New comment content',
                taskId: 999,
                userId: 1,
            };

            mockTaskRepository.findOne.mockResolvedValue(null);

            await expect(service.create(createCommentDto)).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.create(createCommentDto)).rejects.toThrow(
                'A tarefa nao existe.',
            );
        });
    });

    describe('findAll', () => {
        it('should be defined', () => {
            expect(service.findAll).toBeDefined();
        });

        it('should find all comments for a specific task and return success message', async () => {
            const filters = {
                taskId: 1,
                page: 1,
                limit: 10,
            };
            const comments = [mockComment, { ...mockComment, id: 2 }];
            const total = 2;

            mockQueryBuilder.getManyAndCount.mockResolvedValue([comments, total]);

            const result = await service.findAll(filters);

            expect(commentRepository.createQueryBuilder).toHaveBeenCalledWith('comments');
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('comments.createdAt', 'DESC');
            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('comments.taskId = :taskId', { taskId: filters.taskId });
            expect(result).toBeDefined();
            expect(result.message).toBe('Comentários carregados com sucesso');
            expect(result.data).toBeDefined();
            expect(result.data?.length).toBe(2);
            expect(result.meta).toBeDefined();
            expect(result.meta?.total).toBe(2);
            expect(result.meta?.limit).toBe(10);
            expect(result.meta?.totalPages).toBe(1);
            expect(result.meta?.page).toBe(1);
        });

        it('should return empty array if task has no comments', async () => {
            const filters = {
                taskId: 1,
                page: 1,
                limit: 10,
            };

            mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

            const result = await service.findAll(filters);

            expect(result.message).toBe('Comentários carregados com sucesso');
            expect(result.data).toEqual([]);
            expect(result.meta?.total).toBe(0);
            expect(result.meta?.limit).toBe(10);
        });

        it('should handle pagination correctly', async () => {
            const filters = {
                taskId: 1,
                page: 2,
                limit: 5,
            };
            const comments = [mockComment];
            const total = 6;

            mockQueryBuilder.getManyAndCount.mockResolvedValue([comments, total]);

            const result = await service.findAll(filters);

            expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
            expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
            expect(result.meta?.totalPages).toBe(2);
            expect(result.meta?.page).toBe(2);
        });
    });
});
