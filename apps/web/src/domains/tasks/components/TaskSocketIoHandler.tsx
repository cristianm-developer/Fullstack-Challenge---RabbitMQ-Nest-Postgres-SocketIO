import type { NotificationMessageSchemaType } from "@/schemes/notificationScheme";
import { useSocketStore } from "@/store/socket.store";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";


export const TaskSocketIoHandler = () => {

    const WS_NOTIFICATIONS = {
        taskCreated: 'task:task-created',
        taskUpdated: 'task:task-updated',
        commentNew: 'comment:comment-new',
    } as const;

    const navigate = useNavigate();
    
    const { handleNewEvent, socket } = useSocketStore();
    
    const handleNotification = (notification: NotificationMessageSchemaType) => {
        console.log(notification.data);
        toast.info(notification.title ?? 'Nova notificação', {
            description: notification.message,
            action: {
                label: 'Ver tarefa',
                onClick: () => {
                    navigate({ to: '/Tasks/Detailed', search: { id: notification.data?.id } });
                },
            },
        });
    }

    useEffect(() => {

        if(socket) {
            handleNewEvent(WS_NOTIFICATIONS.commentNew, handleNotification);
            handleNewEvent(WS_NOTIFICATIONS.taskCreated, handleNotification);
            handleNewEvent(WS_NOTIFICATIONS.taskUpdated, handleNotification);
        }

        return () => {
            if(socket) {
                socket.off(WS_NOTIFICATIONS.commentNew, handleNotification);
                socket.off(WS_NOTIFICATIONS.taskCreated, handleNotification);
                socket.off(WS_NOTIFICATIONS.taskUpdated, handleNotification);
            }
        }
    }, [socket])


    return null;
}