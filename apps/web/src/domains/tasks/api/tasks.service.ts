import { apiClient } from "@/api/apiClient";
import type { PaginationSchema } from "@/schemes/paginationSchema";
import type { CommentSchema, CreateCommentSchema, CreateTaskSchema, FindAllCommentsFiltersSchema, TaskListFilterSchema, TaskListResponseSchema, TaskResponseSchema, TaskSchema } from "@/schemes/tasksSchema";


export const TASKS_ENDPOINTS = {
    FIND_ALL_TASKS: 'tasks',
    FIND_TASK_BY_ID: 'tasks/:id',
    CREATE_TASK: 'tasks',
    UPDATE_TASK: 'tasks/:id',
    CREATE_COMMENT: 'tasks/:id/comments',
    FIND_ALL_COMMENTS: 'tasks/:id/comments',
}

export const getTasks = async (filters: TaskListFilterSchema, pagination: PaginationSchema) => {
    const params = new URLSearchParams();
    filters.title && params.append('title', filters.title);
    filters.status && params.append('status', filters.status);
    filters.priority && params.append('priority', filters.priority);
    filters.userIds && filters.userIds.forEach(userId => params.append('userIds', userId.toString()));
    params.append('page', pagination.page.toString());
    params.append('limit', pagination.limit.toString());
    const res = await apiClient.get<TaskListResponseSchema>(TASKS_ENDPOINTS.FIND_ALL_TASKS, {params});
    return res.data;
}

export const getTaskById = async (id: number) => {
    const res = await apiClient.get<TaskSchema>(TASKS_ENDPOINTS.FIND_TASK_BY_ID.replace(':id', id.toString()));
    return res.data;
}

export const createTask = async (task: CreateTaskSchema) => {
    const res = await apiClient.post<TaskResponseSchema>(TASKS_ENDPOINTS.CREATE_TASK, task);
    return res.data;
}

export const updateTask = async (taskId: number, task: CreateTaskSchema) => {
    
    const res = await apiClient.put<TaskResponseSchema>(TASKS_ENDPOINTS.UPDATE_TASK.replace(':id', taskId.toString()), task);
    return res.data;
}

export const createComment = async (taskId: number, comment: CreateCommentSchema) => {
    const res = await apiClient.post<CommentSchema>(TASKS_ENDPOINTS.CREATE_COMMENT.replace(':id', taskId.toString()), comment);
    return res.data;
}

export const findAllComments = async (taskId: number, filters: FindAllCommentsFiltersSchema) => {
    const params = new URLSearchParams();
    params.append('page', filters.page.toString());
    params.append('limit', filters.limit.toString());
    const res = await apiClient.get<CommentSchema[]>(TASKS_ENDPOINTS.FIND_ALL_COMMENTS.replace(':id', taskId.toString()), {params});
    return res.data;
}