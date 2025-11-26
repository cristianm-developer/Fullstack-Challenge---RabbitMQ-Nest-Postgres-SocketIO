import type { CreateCommentSchema } from "@/schemes/tasksSchema"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createComment } from "../api/tasks.service"
import { toastError } from "@/api/apiClient"
import { useTaskQueryKey } from "./useTaskQuery"
import { toast } from "sonner"
import { useCommentsQueryKey } from "./useCommentsQuery"


export const useCreateCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ( params: {taskId: number, comment: CreateCommentSchema}) => createComment(params.taskId, params.comment),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [useTaskQueryKey, variables.taskId] });
            queryClient.invalidateQueries({ queryKey: [useCommentsQueryKey, variables.taskId] });
            toast.success('Comentário criado com sucesso');
        },
        onError: (error) => {
            toastError(error);
        },
    })
}