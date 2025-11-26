import { useForm } from "react-hook-form";
import { TaskListedSkeleton } from "./TaskListedSkeleton";
import {
  taskListFilterSchema,
  type TaskListFilterSchema,
  type TaskListResponseSchema,
} from "@/schemes/tasksSchema";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PaginationSchema } from "@/schemes/paginationSchema";
import { useTaskQuery } from "../hooks/useTaskQuery";
import { TaskFilters } from "./TaskFilters";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { TaskListed } from "./TaskListed";
import { Link } from "@tanstack/react-router";
import { TaskPagination } from "./TaskPagination";

export const TaskList = () => {
  const LIMIT_PER_PAGE = 10;
  const [pagination, setPagination] = useState<PaginationSchema>({
    page: 1,
    limit: LIMIT_PER_PAGE,
  });
  const [currentFilter, setCurrentFilter] = useState<TaskListFilterSchema>({});

  const filterForm = useForm<TaskListFilterSchema>({
    resolver: zodResolver(taskListFilterSchema),
  });

  const {
    data: queryResult,
    isLoading,
    isFetching,
    isError,
  } = useTaskQuery(currentFilter, pagination) as {
    data: TaskListResponseSchema;
    isLoading: boolean;
    isError: boolean;
    error: Error;
    isFetching: boolean;
  };

  const onSubmitFilters = (data: TaskListFilterSchema) => {
    setPagination({ page: 1, limit: LIMIT_PER_PAGE });
    setCurrentFilter(data);
  };

  const onPageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  const tasks = queryResult?.data;
  const meta = queryResult?.meta || {
    total: 0,
    page: 0,
    totalPages: 0,
    limit: 1,
  };

  return (
    <div className="w-full h-full overflow-hidden flex flex-col gap-4">
      <div
        className="bg-background h-3 w-full absolute bottom-0 left-0"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black)",
        }}
      ></div>
      <div className="flex gap-4">
        <TaskFilters onSubmit={onSubmitFilters} />
      </div>
      <div className="flex flex-col gap-4 w-full overflow-y-auto pb-6 pr-2">
        {isError ? (
          <Empty>
            <EmptyTitle>Erro ao carregar tarefas</EmptyTitle>
            <EmptyDescription>
              Ocorreu um erro ao carregar as tarefas.
            </EmptyDescription>
          </Empty>
        ) : isLoading || isFetching ? (
          <TaskListedSkeleton />
        ) : filterForm.formState.isDirty && tasks?.length == 0 ? (
          <Empty>
            <EmptyTitle>Nenhuma tarefa encontrada</EmptyTitle>
            <EmptyDescription>
              Nenhuma tarefa encontrada para a busca atual.
            </EmptyDescription>
          </Empty>
        ) : tasks?.length == 0 && Object.values(currentFilter).length == 0 ? (
          <Empty>
            <EmptyTitle>Não há tarefas criadas</EmptyTitle>
            <EmptyDescription>
              <Link to="/Tasks/Detailed" search={{ edit: true }}>
                Criar uma nova tarefa
              </Link>
            </EmptyDescription>
          </Empty>
        ) : tasks?.length == 0 && Object.values(currentFilter).length > 0 ? (
          <Empty>
            <EmptyTitle>Nenhuma tarefa encontrada</EmptyTitle>
            <EmptyDescription>
              Nenhuma tarefa encontrada para a busca atual.
            </EmptyDescription>
          </Empty>
        ) :
         tasks?.length > 0 && (
          tasks?.map((task) => <TaskListed key={task.id} task={task} />)
        )}
        {!isError && <TaskPagination meta={meta} setPage={onPageChange} />}
      </div>
    </div>
  );
};
