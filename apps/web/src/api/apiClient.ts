import { refreshAccessToken } from "@/domains/auth/api/auth.service";
import { useAuthStore } from "@/domains/auth/store/auth.store";
import axios from "axios";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export const toastError = (error: any) => {
  if(error.response?.data?.message){
    toast.error(error.response.data.message);
  }
  else {
    toast.error('Erro desconhecido, tente novamente mais tarde');
  }
}

export const apiClientUnauthenticated = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const {accessToken} = useAuthStore.getState();
  if(accessToken){
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;

});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { refreshToken, isRefreshing, setTokens, setIsRefreshing, logout } =
      useAuthStore.getState();

    const isAuthError = error.response?.status === 401;

    if (isAuthError && !originalRequest?._retry && refreshToken) {
      originalRequest._retry = true;
      if (!isRefreshing) {
        setIsRefreshing(true);
        try {
          const newTokens = await refreshAccessToken(refreshToken);
          setTokens(newTokens);
          setIsRefreshing(false);
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

          return apiClient(originalRequest);
        } catch (e) {
          logout();
          setIsRefreshing(false);
          return Promise.reject(error);
        }
      }

      await new Promise<void>((resolve) => {
        const unsubscribe = useAuthStore.subscribe(
          state => state.isRefreshing,
          (newIsRefreshing) => {
            if(!newIsRefreshing) {
              unsubscribe();
              resolve();
            }
          }
        );
        if(!useAuthStore.getState().isRefreshing){
          unsubscribe();
          resolve();
        }
      });

      const {accessToken} = useAuthStore.getState();
      if(accessToken){
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      }

      
      logout();
      return Promise.reject(error);
      
    } 

    return Promise.reject(error);
  }
);
