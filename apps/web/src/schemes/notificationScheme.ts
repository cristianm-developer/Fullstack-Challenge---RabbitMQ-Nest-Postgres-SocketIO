import { z } from "zod";
    
export const NotificationMessageSchema = z.object({
    message: z.string(),
    data: z.any().optional(),
    createdBy: z.number().optional(),
    event: z.string(),
    title: z.string().optional(),
    type: z.string().optional(),
    userIds: z.array(z.string()).optional(),
});

export type NotificationMessageSchemaType = z.infer<typeof NotificationMessageSchema>;