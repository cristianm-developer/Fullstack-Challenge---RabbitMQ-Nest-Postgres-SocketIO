import { Card, CardContent } from "@/components/ui/card";
import type { TaskListedSchema } from "@/schemes/tasksSchema";
import { TaskPriority } from "../consts/TaskPriority";
import { TaskStatusObject } from "../consts/TaskStatus";
import { Link } from "@tanstack/react-router";

export const TaskListed = ({ task }: { task: TaskListedSchema }) => {
  return (
    <Card className="w-full p-2 px-0 gap-1 bg-secondary cursor-pointer hover:bg-secondary/80" onClick={() => document.querySelector<HTMLAnchorElement>(`#task-listed-${task.id}`)?.click()}  >
      <Link to="/Tasks/Detailed" search={{ id: task.id }} id={`task-listed-${task.id}`}>  
      </Link>      
      <CardContent className="flex gap-8 px-3 pr-4 justify-start opacity-70">
        <div className="flex flex-col gap-0" style={{ gap: '400px'}}>
          <label className="text-sm">Título</label>
          <span className="text-sm font-bold">{task.title}</span>
        </div>
        <div className="flex flex-col gap-0" style={{ flex: "30px" }}>
          <label className="text-sm">Prazo</label>
          <span>{new Date(task.deadline).toLocaleDateString()}</span>
        </div>
        <div className="flex flex-col gap-0" style={{ flex: "30px" }}>
          <label className="text-sm">Prioridade</label>
          <span>{TaskPriority[task.priority].label}</span>
        </div>
        <div className="flex flex-col gap-0" style={{ flex: "30px" }}>
          <label className="text-sm">Status</label>
          <span>{TaskStatusObject[task.status].label}</span>
        </div>
        
      </CardContent>
    </Card>
  );
};
