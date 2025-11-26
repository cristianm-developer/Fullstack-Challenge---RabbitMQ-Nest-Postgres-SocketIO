import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { findAllUsers } from "../api/auth.service";

export const useGetUsersQueryKey = 'users';
export const useGetUsersQuery = () => {
    return useQuery({
        queryKey: [useGetUsersQueryKey],
        queryFn: async () => await findAllUsers(),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 15,
    });
}