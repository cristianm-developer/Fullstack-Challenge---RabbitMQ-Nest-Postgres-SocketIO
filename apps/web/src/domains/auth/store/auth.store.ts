import type { AuthSubSchema, AuthTokensSchema } from "@/schemes/authSchema";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";

export interface AuthStore {
  sub: AuthSubSchema | null;
  setSub: (sub: AuthSubSchema) => void;
  accessToken: string | null;
  refreshToken: string | null;
  isRefreshing: boolean;
  isHydrated: boolean;
  setTokens: (tokens: AuthTokensSchema) => void;
  setIsRefreshing: (isRefreshing: boolean) => void;
  setIsHydrated: (isHydrated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    subscribeWithSelector((set) => ({
      accessToken: null,
      refreshToken: null,
      isHydrated: false,
      isRefreshing: false,
      sub: null,
      setSub: (sub: AuthSubSchema) => set({ sub }),

      setTokens: (tokens: AuthTokensSchema) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),

      logout: () =>{
        set({
          sub: null,
          accessToken: null,
          refreshToken: null,
        });    
      },
      setIsHydrated: (isHydrated: boolean) => set({ isHydrated }),
      setIsRefreshing: (status: boolean) => set({ isRefreshing: status }),
    })),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        sub: state.sub,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("Error rehydrating auth store:", error);
          } else if(state) {
            state.setIsHydrated(true);
          }
        };
      },
    }
  )
);
