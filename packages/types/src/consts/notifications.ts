export const WS_NOTIFICATIONS = {
    taskCreated: 'task:task-created',
    taskUpdated: 'task:task-updated',
    commentNew: 'comment:comment-new',
} as const;

export type WSNotificationType = keyof typeof WS_NOTIFICATIONS;
export type WSNotificationValue = typeof WS_NOTIFICATIONS[WSNotificationType];
