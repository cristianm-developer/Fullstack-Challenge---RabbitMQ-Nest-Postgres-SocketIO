import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { useAuthStore } from "@/domains/auth/store/auth.store";
import { HomeIcon } from "lucide-react";
import { TaskSocketIoHandler } from "@/domains/tasks/components/TaskSocketIoHandler";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { sub } = useAuthStore();
  return (
    <>
      <div className="flex justify-between p-2 dark:bg-gray-900 items-center">
        <div className="flex items-center gap-2">
          <h1
            style={{
              height: "min-content",
              lineHeight: "1rem",
            }}
            className="font-bold"
          >
            Jungle Gaming - Challenge
          </h1>
          <Link to="/">
            <HomeIcon></HomeIcon>
          </Link>
        </div>
        <nav className="flex items-center gap-2">
          <span className="text-sm">{sub?.username}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              logout();
              navigate({ to: "/auth/login" });
            }}
          >
            Sair
          </Button>
        </nav>
      </div>
      <TaskSocketIoHandler />
      {children}
    </>
  );
};
