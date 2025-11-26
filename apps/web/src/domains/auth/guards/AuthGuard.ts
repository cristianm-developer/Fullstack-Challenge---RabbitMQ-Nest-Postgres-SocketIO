import { useAuthStore } from "@/domains/auth/store/auth.store"
import { redirect } from "@tanstack/react-router"

export const AuthGuard = (context: any) => {

    const { accessToken } = useAuthStore.getState();

    if(!accessToken) {

        throw redirect({
            to: '/auth/login',
            search: {
                redirect: context.location.pathname
            }
        })

    }

    return true;

}