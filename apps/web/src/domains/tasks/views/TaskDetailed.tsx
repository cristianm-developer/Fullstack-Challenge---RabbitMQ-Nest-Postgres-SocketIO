import { useSearch } from "@tanstack/react-router";
import { useTaskDetailedQuery } from "../hooks/useTaskDetailedQuery";
import { TaskDetailedEditor } from "../components/TaskDetailedEdit";
import { TaskDetailedViewer } from "../components/TaskDetailedView";
import { TaskDetailedViewSkeleton } from "../components/TaskDetailedViewSkeleton";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";

export const TaskDetailed = () => {
  const { id, edit } = useSearch({ from: "/_authenticated/Tasks/Detailed" });
  const { data, isLoading, isError } = useTaskDetailedQuery(id);

  return (
    <div className="flex flex-col gap-4 p-6 h-full w-full ">
      {edit ? (
        <TaskDetailedEditor task={data} />
      ) : isLoading ? (
        <TaskDetailedViewSkeleton />
      ) : isError || !data ? (
        <Empty>
          <EmptyTitle>Erro ao carregar tarefa</EmptyTitle>
          <EmptyDescription>
            Ocorreu um erro ao carregar a tarefa.
          </EmptyDescription>
        </Empty>
      ) : (
        data && <TaskDetailedViewer task={data} />
      )}
    </div>
  );
};
