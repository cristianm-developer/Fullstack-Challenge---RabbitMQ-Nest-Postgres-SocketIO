import { apiClient, apiClientUnauthenticated } from "@/api/apiClient"
import type { AuthTokensSchema, LoginSchema, RegisterSchema, UserListedSchema } from "@/schemes/authSchema";

const AUTH_ENDPOINTS = {
    REFRESH_ACCESS_TOKEN: 'auth/refresh-token',
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    FIND_ALL_USERS: 'auth/users',
}
export const refreshAccessToken = async (refreshToken: string) => {
    
    try {
        const res = await apiClientUnauthenticated.post<AuthTokensSchema>(AUTH_ENDPOINTS.REFRESH_ACCESS_TOKEN, {
            refreshToken
        });
        return res.data;
    } catch (error) {
        throw error;
    }
}

export const login = async (data: LoginSchema) => {
    try {
        const res = await apiClientUnauthenticated.post<AuthTokensSchema>(AUTH_ENDPOINTS.LOGIN, data);
        return res.data;
    } catch (error) {
        throw error;
    }
}

export const register = async (data: RegisterSchema) => {
    try {
        const res = await apiClientUnauthenticated.post<AuthTokensSchema>(AUTH_ENDPOINTS.REGISTER, data);
        return res.data;
    } catch (error) {
        throw error;
    }
}


export const findAllUsers = async () => {
    try {
        const res = await apiClient.get<UserListedSchema[]>(AUTH_ENDPOINTS.FIND_ALL_USERS);
        return res.data;
    } catch (error) {
        throw error;
    }
}