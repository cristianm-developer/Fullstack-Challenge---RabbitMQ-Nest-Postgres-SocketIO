import { findAllCommentsResponseSchema, type FindAllCommentsFiltersSchema } from "@/schemes/tasksSchema";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { findAllComments } from "../api/tasks.service";

export const useCommentsQueryKey = 'comments';

export const useCommentsQuery = (taskId: number, pagination: FindAllCommentsFiltersSchema) => {
    return useQuery({   
        queryKey: [useCommentsQueryKey, taskId, pagination],
        queryFn: () => findAllComments(taskId, pagination),
        select: (data) =>   findAllCommentsResponseSchema.parse(data),
        placeholderData: keepPreviousData            
    })
}