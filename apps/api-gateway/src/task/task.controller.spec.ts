import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { 
    FindAllFilters,
    AddLogDto,
    TaskStatus,
    TaskPriority,
    JwtPayload,
} from '@repo/types';
import { AuthGuard } from '../auth/auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

const mockTaskService = {
  create: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  addLog: jest.fn(),
  createComment: jest.fn(),
  findAllComments: jest.fn(),
};

const mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;
  const mockUser: JwtPayload = { sub: 1 };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(controller.create).toBeDefined();
    });

    it('should call taskService.create with correct payload', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        userIds: [1, 2],
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
      };
      const taskData = { id: 1, ...createTaskDto, createdBy: mockUser.sub };
      const serviceResponse = {
        data: taskData,
        message: 'Tarefa criada com sucesso',
      };

      mockTaskService.create.mockResolvedValue(serviceResponse);

      const result = await controller.create(createTaskDto, mockUser);

      expect(service.create).toHaveBeenCalledWith({ ...createTaskDto, createdBy: mockUser.sub });
      expect(result).toBeDefined();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
    });
  });

  describe('update', () => {
    it('should be defined', () => {
      expect(controller.update).toBeDefined();
    });

    it('should call taskService.update with correct payload', async () => {
      const updateTaskDto: CreateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
        userIds: [1, 2],
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
      };
      const taskId = 1;
      const taskData = { id: 1, title: 'Updated Task' };
      const serviceResponse = {
        data: taskData,
        message: 'Tarefa atualizada com sucesso',
      };

      mockTaskService.update.mockResolvedValue(serviceResponse);

      const result = await controller.update(taskId, updateTaskDto, mockUser);

      expect(service.update).toHaveBeenCalledWith({
        task: updateTaskDto,
        updatedBy: mockUser.sub,
        taskId: taskId,
      });
      expect(result).toBeDefined();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
    });
  });

  describe('findAll', () => {
    it('should be defined', () => {
      expect(controller.findAll).toBeDefined();
    });

    it('should call taskService.findAll with filters', async () => {
      const filters: FindAllFilters = { status: TaskStatus.TODO, page: 1, limit: 10 };
      const expectedResponse = {
        data: [{ id: 1, title: 'Task 1' }],
        meta: {
          totalItems: 1,
          itemsCount: 1,
          totalPages: 1,
          currentPage: 1,
        },
      };

      mockTaskService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
      expect(result).toBeDefined();
    });

    it('should call taskService.findAll with filters including pagination', async () => {
      const filters: FindAllFilters = { 
        status: TaskStatus.TODO, 
        page: 1, 
        limit: 10 
      };
      const expectedResponse = {
        data: [{ id: 1, title: 'Task 1' }],
        meta: {
          totalItems: 1,
          itemsCount: 1,
          totalPages: 1,
          currentPage: 1,
        },
      };

      mockTaskService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should be defined', () => {
      expect(controller.findOne).toBeDefined();
    });

    it('should call taskService.findOne with id', async () => {
      const id = 1;
      const expectedResponse = {
        id: 1,
        title: 'Task 1',
        description: 'Test Description',
        deadline: new Date(),
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        createdAt: new Date(),
        createdBy: 1,
        userIds: [1, 2],
      };

      mockTaskService.findOne.mockResolvedValue(expectedResponse);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
    });
  });

  describe('createComment', () => {
    it('should be defined', () => {
      expect(controller.createComment).toBeDefined();
    });

    it('should call taskService.createComment with correct payload', async () => {
      const taskId = 1;
      const createCommentDto: CreateCommentDto = {
        content: 'Test comment',
      };
      const expectedResponse = { id: 1, ...createCommentDto, taskId, userId: mockUser.sub };

      mockTaskService.createComment.mockResolvedValue(expectedResponse);

      const result = await controller.createComment(taskId, createCommentDto, mockUser);

      expect(service.createComment).toHaveBeenCalledWith({
        ...createCommentDto,
        userId: mockUser.sub,
        taskId: taskId,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findAllComments', () => {
    it('should be defined', () => {
      expect(controller.findAllComments).toBeDefined();
    });

    it('should call taskService.findAllComments with taskId and pagination', async () => {
      const taskId = 1;
      const pagination = { page: 1, limit: 10 };
      const expectedResponse = [
        { id: 1, content: 'Comment 1', taskId: 1 },
        { id: 2, content: 'Comment 2', taskId: 1 },
      ];

      mockTaskService.findAllComments.mockResolvedValue(expectedResponse);

      const result = await controller.findAllComments(taskId, pagination);

      expect(service.findAllComments).toHaveBeenCalledWith(taskId, pagination);
      expect(result).toEqual(expectedResponse);
    });
  });
});
