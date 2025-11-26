import {type TaskListFilterSchema, type TaskListResponseSchema } from "@/schemes/tasksSchema";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTasks } from "../api/tasks.service";
import type { PaginationSchema } from "@/schemes/paginationSchema";


export const useTaskQueryKey = 'tasks';

export const useTaskQuery = (filters: TaskListFilterSchema, pagination: PaginationSchema) => {

    return useQuery<TaskListResponseSchema>({
        queryKey: [useTaskQueryKey, filters, pagination],
        queryFn: async () => getTasks(filters, pagination),
        placeholderData: keepPreviousData
    })
}