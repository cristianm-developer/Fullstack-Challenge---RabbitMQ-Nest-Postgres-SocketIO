import { TaskDetailed } from '@/domains/tasks/views/TaskDetailed'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'



const TaskDetailedSearchSchema = z.object({
  edit: z.boolean().optional(),
  id: z.number().optional()
});

export const Route = createFileRoute('/_authenticated/Tasks/Detailed')({
  component: RouteComponent,
  validateSearch: TaskDetailedSearchSchema,
})

function RouteComponent() {
  return <TaskDetailed />
}
