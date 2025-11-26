import z from "zod";
import { paginationInfoSchema } from "./paginationSchema";
import { TaskStatusKeysArray } from "@/domains/tasks/consts/TaskStatus";
import { TaskPriorityKeysArray } from "@/domains/tasks/consts/TaskPriority";

export const taskListedSchema = z.object({
    id: z.number(),
    title: z.string(),
    deadline: z.date(),
    priority: z.enum(TaskPriorityKeysArray),
    status: z.enum(TaskStatusKeysArray),
});

export type TaskListedSchema = z.infer<typeof taskListedSchema>;

export const taskListResponseSchema = z.object({
    data: z.array(taskListedSchema),
    meta: paginationInfoSchema,
})

export type TaskListResponseSchema = z.infer<typeof taskListResponseSchema>;

export const taskSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string().optional(),
    deadline: z.coerce.date(),
    priority: z.enum(TaskPriorityKeysArray),
    status: z.enum(TaskStatusKeysArray),
    createdAt: z.coerce.date(),
    createdBy: z.number(),
    userIds: z.array(z.number()),
})

export type TaskSchema = z.infer<typeof taskSchema>;

export const taskResponseSchema = z.object({
    data: taskSchema,
    message: z.string(),
})

export type TaskResponseSchema = z.infer<typeof taskResponseSchema>;

export const createTaskSchema = z.object({
    title: z.string().min(1, { message: 'Título é obrigatório' }),
    description: z.string().optional(),
    deadline: z.date( { required_error: 'Prazo é obrigatório' }),
    priority: z.enum(TaskPriorityKeysArray, { required_error: 'Prioridade é obrigatória' }),
    userIds: z.array(z.number()).optional(),    
    status: z.enum(TaskStatusKeysArray, { required_error: 'Status é obrigatório' }),
})

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;

export const taskListFilterSchema = z.object({
    title: z.string().optional(),
    status: z.enum(TaskStatusKeysArray).optional(),
    priority: z.enum(TaskPriorityKeysArray).optional(),
    userIds: z.array(z.number()).optional(),
})

export type TaskListFilterSchema = z.infer<typeof taskListFilterSchema>;

export const CreateCommentSchema = z.object({
    content: z.string().min(1, { message: 'Conteúdo é obrigatório' }).max(1000, { message: 'Conteúdo deve ter no máximo 1000 caracteres' })
})

export type CreateCommentSchema = z.infer<typeof CreateCommentSchema>;

export const CommentSchema = z.object({
    id: z.number(),
    content: z.string(),
    createdAt: z.coerce.date(),
    userId: z.number(),
})

export type CommentSchema = z.infer<typeof CommentSchema>;

export const findAllCommentsResponseSchema = z.object({
    data: z.array(CommentSchema),
    meta: paginationInfoSchema,
})

export type FindAllCommentsResponseSchema = z.infer<typeof findAllCommentsResponseSchema>;

export const findAllCommentsFiltersSchema = z.object({
    page: z.number(),
    limit: z.number(),
})

export type FindAllCommentsFiltersSchema = z.infer<typeof findAllCommentsFiltersSchema>;