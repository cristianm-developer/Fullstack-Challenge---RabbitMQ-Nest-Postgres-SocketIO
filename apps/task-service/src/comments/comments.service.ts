import {
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Task } from '../tasks/entities/task.entity';
import { CreateCommentDto, ResponseDto, TASK_PATTERNS, WS_NOTIFICATIONS } from '@repo/types';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @Inject('TASK_SERVICE')
        private readonly taskClient: ClientProxy,
        private readonly notificationsService: NotificationsService,
    ) {}

    async create(
        createCommentDto: CreateCommentDto,
    ): Promise<ResponseDto<Comment>> {
        const task = await this.taskRepository.findOne({
            where: { id: createCommentDto.taskId },
        });

        if (!task) {
            throw new NotFoundException('A tarefa nao existe.');
        }

        const comment = this.commentRepository.create({
            content: createCommentDto.content,
            taskId: createCommentDto.taskId,
            userId: createCommentDto.userId,
        });

        const savedComment = await this.commentRepository.save(comment);

        this.taskClient.emit(TASK_PATTERNS.ADD_TASK_LOG, {
            taskId: savedComment.taskId,
            userId: savedComment.userId,
            change: `Comentário criado: ${savedComment.content}`,
        });

        this.notificationsService.handleNotification({
            message: `Novo comentario na tarefa ${task.title}`,
            data: { url: `/tasks/${task.id}` },
            title: 'Novo comentario',
            type: 'INFO',
            userIds: [task.userId.toString()],
            event: WS_NOTIFICATIONS.commentNew,
        });
        return {
            message: 'Comentário criado com sucesso',
            data: savedComment,
        };
    }

    async findAll(taskId: number): Promise<ResponseDto<Comment[]>> {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
        });

        if (!task) {
            throw new NotFoundException('A tarefa nao existe.');
        }

        const comments = await this.commentRepository.find({
            where: { taskId },
            relations: ['task'],
        });

        return {
            message: 'Comentários carregados com sucesso',
            data: comments,
        };
    }
}
