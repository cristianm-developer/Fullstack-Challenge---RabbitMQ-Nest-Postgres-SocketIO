import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { ClientProxy } from '@nestjs/microservices';
import { 
    TASK_PATTERNS, 
    COMMENT_PATTERNS,
    CreateTaskDto,
    UpdateTaskDto,
    FindAllFilters,
    AddLogDto,
    CreateCommentDto,
    TaskStatus,
    TaskPriority,
} from '@repo/types';
import { of } from 'rxjs';
import { PaginationDto } from './dto/pagination-dto';

describe('TaskService', () => {
  let service: TaskService;
  let taskClient: ClientProxy;

  const mockClientProxy = {
    send: jest.fn(),
    emit: jest.fn(),
  };

  const mockTaskClient = {
    ...mockClientProxy,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: 'TASK_CLIENT', useValue: mockTaskClient },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskClient = module.get<ClientProxy>('TASK_CLIENT');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(service.create).toBeDefined();
    });

    it('should call task microservice with CREATE_TASK pattern', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        prazo: new Date(),
        priority: TaskPriority.MEDIUM as any,
        status: TaskStatus.TODO,
        userIds: [1, 2],
        creatorId: 1,
      };
      const expectedResponse = { id: 1, ...createTaskDto };

      mockTaskClient.send.mockReturnValue(of(expectedResponse));

      const result = await service.create(createTaskDto);

      expect(taskClient.send).toHaveBeenCalledWith(TASK_PATTERNS.CREATE_TASK, createTaskDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('update', () => {
    it('should be defined', () => {
      expect(service.update).toBeDefined();
    });

    it('should call task microservice with UPDATE_TASK pattern', async () => {
      const updateTaskDto: UpdateTaskDto = {
        id: 1,
        title: 'Updated Task',
        priority: TaskPriority.MEDIUM as any,
        status: TaskStatus.TODO as any,
        userIds: [1, 2],
      };
      const expectedResponse = { id: 1, title: 'Updated Task' };

      mockTaskClient.send.mockReturnValue(of(expectedResponse));

      const result = await service.update(updateTaskDto);

      expect(taskClient.send).toHaveBeenCalledWith(TASK_PATTERNS.UPDATE_TASK, updateTaskDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findAll', () => {
    it('should be defined', () => {
      expect(service.findAll).toBeDefined();
    });

    it('should call task microservice with FIND_ALL_TASKS pattern', async () => {
      const filters: FindAllFilters = { status: TaskStatus.TODO, page: 1, limit: 10 };
      const expectedResponse = [{ id: 1, title: 'Task 1' }];

      mockTaskClient.send.mockReturnValue(of(expectedResponse));

      const result = await service.findAll(filters);

      expect(taskClient.send).toHaveBeenCalledWith(TASK_PATTERNS.FIND_ALL_TASKS, filters);
      expect(result).toBeDefined();
    });

    it('should call with empty object when no filters provided', async () => {
      const expectedResponse = [{ id: 1, title: 'Task 1' }];

      mockTaskClient.send.mockReturnValue(of(expectedResponse));

      const result = await service.findAll();

      expect(taskClient.send).toHaveBeenCalled()
      expect(result).toBeDefined();
    });

    it('should call task microservice with FIND_ALL_TASKS pattern including pagination', async () => {
      const filters: FindAllFilters = { 
        status: TaskStatus.TODO, 
        page: 1, 
        limit: 10 
      };
      const expectedResponse = [{ id: 1, title: 'Task 1' }];

      mockTaskClient.send.mockReturnValue(of(expectedResponse));

      const result = await service.findAll(filters);

      expect(taskClient.send).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should be defined', () => {
      expect(service.findOne).toBeDefined();
    });

    it('should call task microservice with FIND_ONE_TASK pattern', async () => {
      const id = 1;
      const expectedResponse = { id: 1, title: 'Task 1' };

      mockTaskClient.send.mockReturnValue(of(expectedResponse));

      const result = await service.findOne(id);

      expect(taskClient.send).toHaveBeenCalledWith(TASK_PATTERNS.FIND_ONE_TASK, { id });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('addLog', () => {
    it('should be defined', () => {
      expect(service.addLog).toBeDefined();
    });

    it('should call task microservice with ADD_TASK_LOG pattern', async () => {
      const logDto: AddLogDto = {
        taskId: 1,
        userId: 1,
        change: 'Status updated',
      };
      const expectedResponse = { id: 1, ...logDto };

      mockTaskClient.send.mockReturnValue(of(expectedResponse));

      const result = await service.addLog(logDto);

      expect(taskClient.send).toHaveBeenCalledWith(TASK_PATTERNS.ADD_TASK_LOG, logDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('createComment', () => {
    it('should be defined', () => {
      expect(service.createComment).toBeDefined();
    });

    it('should call task microservice with CREATE_COMMENT pattern', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Test comment',
        taskId: 1,
        userId: 1,
      };
      const expectedResponse = { id: 1, ...createCommentDto };

      mockTaskClient.send.mockReturnValue(of(expectedResponse));

      const result = await service.createComment(createCommentDto);

      expect(taskClient.send).toHaveBeenCalledWith(COMMENT_PATTERNS.CREATE_COMMENT, createCommentDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findAllComments', () => {
    it('should be defined', () => {
      expect(service.findAllComments).toBeDefined();
    });

    it('should call task microservice with FIND_ALL_COMMENTS pattern', async () => {
      const taskId = 1;
      const pagination = { page: 1, limit: 10 };
      const expectedResponse = [
        { id: 1, content: 'Comment 1', taskId: 1 },
        { id: 2, content: 'Comment 2', taskId: 1 },
      ];

      mockTaskClient.send.mockReturnValue(of(expectedResponse));

      const result = await service.findAllComments(taskId, pagination);

      expect(taskClient.send).toHaveBeenCalledWith(COMMENT_PATTERNS.FIND_ALL_COMMENTS, { taskId, ...pagination });
      expect(result).toBeDefined();
    });
  });
});
