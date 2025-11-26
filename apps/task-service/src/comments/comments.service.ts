import {
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Task } from '../tasks/entities/task.entity';
import { CreateCommentDto, FindAllCommentsFilters, ResponseDto, TASK_PATTERNS, WS_NOTIFICATIONS } from '@repo/types';
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
            relations: ['userTasks'],
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
            data: { id: task.id },
            title: 'Novo comentario',            
            createdBy: savedComment.userId,
            type: 'INFO',
            userIds: task.userTasks.map(ut => ut.userId.toString()),
            event: WS_NOTIFICATIONS.commentNew,
        });
        return {
            message: 'Comentário criado com sucesso',
            data: savedComment,
        };
    }

    async findAll(filters: FindAllCommentsFilters): Promise<ResponseDto<Comment[]>> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 10;
        const skip = (page - 1) * limit;

        const queryBuilder = this.commentRepository.createQueryBuilder('comments');
        queryBuilder.orderBy('comments.createdAt', 'DESC');
        queryBuilder.skip(skip);
        queryBuilder.take(limit);
        queryBuilder.where('comments.taskId = :taskId', { taskId: filters.taskId });
        const [comments, total] = await queryBuilder.getManyAndCount();
        return {
            message: 'Comentários carregados com sucesso',
            data: comments,
            meta: {
                total,
                limit,
                totalPages: Math.ceil(total / limit),
                page
            }
        }
    }
}
