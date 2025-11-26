import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { TaskList } from "../components/TaskList"
import { Link } from "@tanstack/react-router"

export const TasksView = () => {
    return (
        <div className="flex flex-col gap-3 p-6 h-full w-full overflow-y-auto" >
            <div className="flex  gap-2">
                <h1 className=" w-full text-2xl font-bold">Tarefas</h1>
                <Link to="/Tasks/Detailed" search={{ edit: true }}>
                    <Button>
                        <PlusIcon className="w-4 h-4"  />
                        <span>
                            Nova Tarefa
                        </span>
                    </Button>
                </Link>
            </div>
            <TaskList />
        </div>

    )
}