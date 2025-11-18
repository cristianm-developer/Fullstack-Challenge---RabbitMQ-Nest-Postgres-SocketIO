import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TasksService } from './tasks.service';

@Controller()
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @MessagePattern('task update')
    async handleTaskUpdate(@Payload() payload: any) {
        const { taskId, action, task, userId } = payload;

        if (!taskId || !task) {
            return { success: false, error: 'Missing required fields' };
        }

        // Create log entry for the update
        const changeMessage = `Tarefa ${action === 'created' ? 'criada' : 'atualizada'}: ${task.title}`;
        
        // Use userId from payload, or try to get from task if available
        const logUserId = userId || task.userId || 1;

        await this.tasksService.addLog({
            taskId,
            userId: logUserId,
            change: changeMessage,
        });

        return { success: true };
    }
}

