import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/domains/auth/store/auth.store";
import type { FindAllCommentsResponseSchema, TaskSchema } from "@/schemes/tasksSchema";
import { Link } from "@tanstack/react-router";
import { PencilIcon } from "lucide-react";
import { MdArrowBack } from "react-icons/md";
import { TaskPriority } from "../consts/TaskPriority";
import { TaskStatusObject } from "../consts/TaskStatus";
import { useGetUsersQuery } from "@/domains/auth/hooks/useGetUsersQuery";
import type { UserListedSchema } from "@/schemes/authSchema";
import { Badge } from "@/components/ui/badge";
import { CommentInput } from "./CommentInput";
import { useCommentsQuery } from "../hooks/useCommentsQuery";
import { useState } from "react";
import type { PaginationSchema } from "@/schemes/paginationSchema";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyTitle } from "@/components/ui/empty";
import { CommentItem } from "./CommentItem";
import { TaskPagination } from "./TaskPagination";

export const TaskDetailedViewer = ({ task }: { task: TaskSchema }) => {
  const { data: users } = useGetUsersQuery() as {
    data: UserListedSchema[];
    isLoading: boolean;
    isError: boolean;
  };

  const [pagination, setPagination] = useState<PaginationSchema>({
    page: 1,
    limit: 10,
  });
  const {
    data: comments,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
  } = useCommentsQuery(task.id, pagination) as {
    data: FindAllCommentsResponseSchema;
    isLoading: boolean;
    isError: boolean;
  };

  const onPageChange = (page: number) => {
    setPagination({ page, limit: pagination.limit });
  };

  const meta = comments?.meta || {
    total: 0,
    page: 0,
    totalPages: 0,
    limit: 1,
  };
  

  const { sub } = useAuthStore();
  return (
    <div className="relative h-full flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center gap-2 justify-between">
        <h1 className="text-2xl font-bold">Tarefa Detalhada</h1>
        <div className="flex items-center gap-2">
          <Link to="/Tasks">
            <Button variant="outline" size="icon">
              <MdArrowBack className="w-4 h-4" />
            </Button>
          </Link>
          {task.createdBy === sub?.userId && (
            <Link to="/Tasks/Detailed" search={{ edit: true, id: task.id }}>
              <Button variant="outline" size="icon">
                <PencilIcon className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
      <div className="w-full bg-background h-6 absolute" style={{
        bottom: '0px',
        zIndex: '1'
      }}></div>
      <div className="h-full flex flex-col gap-4 overflow-y-auto pb-10 relative pr-2">
        <Card className="w-full p-4 gap-2 flex flex-wrap ">
          <CardHeader className="px-3 gap-0">
            <label className="text-sm">Título</label>
            <CardTitle>{task.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 px-3 pr-4 justify-between flex-col">
            <div className="opacity-70 flex gap-4 flex-wrap">
              <div className="flex flex-col gap-0" style={{ flex: "60px" }}>
                <label className="text-sm">Prazo</label>
                <span>{`${new Date(task.deadline).toLocaleDateString()} ${new Date(task.deadline).toLocaleTimeString()}`}</span>
              </div>
              <div className="flex flex-col gap-0" style={{ flex: "60px" }}>
                <label className="text-sm">Prioridade</label>
                <span>{TaskPriority[task.priority].label}</span>
              </div>
              <div className="flex flex-col gap-0" style={{ flex: "60px" }}>
                <label className="text-sm">Status</label>
                <span>{TaskStatusObject[task.status].label}</span>
              </div>
              <div className="flex flex-col gap-0" style={{ flex: "60px" }}>
                <label className="text-sm">Criado por</label>
                <span>{task.createdBy}</span>
              </div>
              <div className="flex flex-col gap-0" style={{ flex: "60px" }}>
                <label className="text-sm">Criado em</label>
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex flex-col gap-0" style={{ flex: "100%" }}>
              <label className="text-sm">Descrição</label>
              <span>{task.description}</span>
            </div>
            <div className="flex flex-col gap-0" style={{ flex: "100%" }}>
              <label className="text-sm">Usuários envolvidos</label>
              <div>
                {task.userIds                  
                  .map((e) => {
                    const user = users?.find((user) => user.id === e);
                    return user ? <Badge variant="outline" key={`user-badge-${e}`}>
                      {user.username}
                    </Badge> : null;
                  })}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">Comentários</h2>
          <CommentInput taskId={task.id} onSubmit={() => {
            setPagination({ page: 1, limit: pagination.limit });
          }}></CommentInput>
          {isCommentsLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="w-full h-16"></Skeleton>
              <Skeleton className="w-full h-16"></Skeleton>
            </div>
          ) : isCommentsError ? (
            <Empty className="opacity-40">
              <EmptyTitle>Erro ao carregar comentários</EmptyTitle>
            </Empty>
          ) : comments?.data.length === 0 ? (
            <Empty className="opacity-40">
              <EmptyTitle>Faça o primeiro comentário</EmptyTitle>
            </Empty>
          ) : (
            comments?.data.map((comment) => (
              <CommentItem key={comment.id} comment={comment} user={users?.find((user) => user.id === comment.userId)} />
            ))
          )}
          {!isCommentsError && <TaskPagination meta={meta} setPage={onPageChange} />}
        </div>
      </div>
    </div>
  );
};
