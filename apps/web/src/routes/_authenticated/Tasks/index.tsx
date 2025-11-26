import { TasksView } from "@/domains/tasks/views/TasksView";
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute('/_authenticated/Tasks/')({
    component: TasksView
})