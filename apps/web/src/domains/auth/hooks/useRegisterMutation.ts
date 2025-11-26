import { type AuthTokensSchema, type RegisterSchema } from "@/schemes/authSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth.store";
import { useNavigate } from "@tanstack/react-router";
import { register } from "../api/auth.service";
import { toastError } from "@/api/apiClient";


export const registerKeys = {
    mutation: ["register"]
}

export const useRegisterMutation = () => {

    const queryClient = useQueryClient();
    const {setTokens, setSub} = useAuthStore(state => state);
    const navigate = useNavigate();

    const mutation = useMutation<AuthTokensSchema, Error, RegisterSchema>({
        mutationFn: register,
        onSuccess: (data) => {
            setTokens(data);
            setSub(data.sub!);
            queryClient.invalidateQueries({ queryKey: ['register'] });
            navigate({ to: "/" });
        },
        onError: (error) => {
            toastError(error);
        }
    })

    const onSubmit = (data: RegisterSchema) => {
        mutation.mutate(data);
    }

    return {
        onSubmit,
        isPending: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error
    };
}