import z from "zod";

export const paginationSchema = z.object({
    page: z.number(),
    limit: z.number(),
});

export type PaginationSchema = z.infer<typeof paginationSchema>;

export const paginationInfoSchema = z.object({
    total: z.number(),
    page: z.number(),
    totalPages: z.number(),
    limit: z.number(),
});

export type PaginationInfoSchema = z.infer<typeof paginationInfoSchema>;
