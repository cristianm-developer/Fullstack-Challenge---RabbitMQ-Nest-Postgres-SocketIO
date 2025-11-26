import { RouterProvider } from "@tanstack/react-router";
import { useAuthStore } from "../store/auth.store";

export const AuthHidratationGate = ({ router }: { router: any }) => {
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) {
    return <div>Carregando...</div>;
  }

  return <RouterProvider router={router}></RouterProvider>;
};
