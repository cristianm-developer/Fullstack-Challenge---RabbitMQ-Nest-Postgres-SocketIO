import { WSNotificationValue } from "../consts/notifications";

export class NotificationMessageDto {   
    message!: string;
    data?: any;
    createdBy?: number;
    event!: WSNotificationValue;
    title?: string;
    type?: string;
    userIds?: string[];
}