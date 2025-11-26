import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask, updateTask } from "../api/tasks.service";
import { toastError } from "@/api/apiClient";
import { useTaskQueryKey } from "./useTaskQuery";
import { toast } from "sonner";
import type { CreateTaskSchema } from "@/schemes/tasksSchema";
import { useNavigate } from "@tanstack/react-router";
import { useTaskDetailedQueryKey } from "./useTaskDetailedQuery";


export const useCreateTaskMutation = () => {

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (params: {data: CreateTaskSchema, taskId: number | undefined}) => {
            if(params.taskId) {
                return updateTask(params.taskId, params.data);
            } else {
                return createTask(params.data);
            }
        },
        onSuccess: (response, variables) => {                    
            const taskId = response.data.id;
            queryClient.invalidateQueries({ queryKey: [useTaskQueryKey] });
            queryClient.invalidateQueries({ queryKey: [useTaskDetailedQueryKey, taskId] });
            toast.success(variables.taskId ? 'Tarefa atualizada com sucesso' : 'Tarefa criada com sucesso');            
            navigate({ to: `/Tasks/Detailed`, search: { id: taskId } });
        },
        onError: (error) => {
            toastError(error);
        },
    });
}