import { useQuery } from "@tanstack/react-query";
import { getTaskById } from "../api/tasks.service";
import { taskSchema } from "@/schemes/tasksSchema";


export const useTaskDetailedQueryKey = 'taskDetailed';

export const useTaskDetailedQuery = (id?: number) => {
    return useQuery({
        queryKey: [useTaskDetailedQueryKey, id],
        queryFn: async () => getTaskById(id!),        
        select: (data) => taskSchema.parse(data),
        enabled: !!id
    })
}