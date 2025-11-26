import { PaginationMeta } from "./pagination";

export class ResponseDto<T> {
    message!: string;
    data?: T;
    meta?: PaginationMeta;
}