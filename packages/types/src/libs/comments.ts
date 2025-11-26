import { PaginationDto } from "./pagination";

export class CreateCommentDto {
    content!: string;
    taskId!: number;
    userId!: number;
}

export class FindAllCommentsFilters extends PaginationDto {
    taskId!: number;
}
