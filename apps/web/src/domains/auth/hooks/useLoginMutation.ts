import { type AuthTokensSchema, type LoginSchema } from "@/schemes/authSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth.store";
import { useNavigate } from "@tanstack/react-router";
import { login } from "../api/auth.service";
import { toastError } from "@/api/apiClient";



export const useLoginMutation = () => {

    const queryClient = useQueryClient();
    const {setTokens, setSub} = useAuthStore(state => state);
    const navigate = useNavigate();

    const mutation = useMutation<AuthTokensSchema, Error, LoginSchema>({
        mutationFn: login,
        onSuccess: async (data) => {
            setTokens(data);
            setSub(data.sub!);
            queryClient.invalidateQueries({ queryKey: ['login'] });
            navigate({ to: "/" });
        },
        onError: (error) => {
            toastError(error);
        }
    })

    const onSubmit = (data: LoginSchema) => {
        mutation.mutate(data);
    }

    return { 
        onSubmit,
        isPending: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error
    };
}