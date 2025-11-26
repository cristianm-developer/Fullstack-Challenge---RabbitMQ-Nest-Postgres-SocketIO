import { 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayConnection, 
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtPayload } from '../../../../packages/types/dist/types/libs/auth';
import { NotificationMessageDto } from '@repo/types';
import { JwtService } from '@nestjs/jwt';
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs';


@Injectable()
@WebSocketGateway({
  cors: true,
  path: '/socket.io',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    private readonly jwtService: JwtService,
    @InjectPinoLogger() private readonly logger: PinoLogger,
  ) {
  }

  @WebSocketServer()
  server!: Server;

  userSocketMap = new Map<string, string>(); 
  socketUserMap = new Map<string, string>();

  handleConnection(client: Socket, ...args: any[]): void {
    this.logger.info(`User connected with socket ${client.id}`);
    this.logger.debug(`Handshake headers: ${JSON.stringify(client.handshake.headers)}`);
    this.logger.debug(`Handshake auth: ${JSON.stringify(client.handshake.auth)}`);
    
    let token = client.handshake.headers.authorization?.split(' ')[1];
    if (!token && (client.handshake.auth as any)?.token) {
      token = (client.handshake.auth as any).token;
    }
    
    if (!token) {
      this.logger.warn(`No token provided for socket ${client.id}`);
      this.logger.warn(`Authorization header: ${client.handshake.headers.authorization}`);
      this.logger.warn(`Auth object: ${JSON.stringify(client.handshake.auth)}`);
      client.disconnect();
      return;
    }
    
    let decoded: JwtPayload;
    try {
      decoded = this.jwtService.verify(token);
    } catch (error) {
      this.logger.error(`Error verifying token: ${error}`);
      client.disconnect();
      return;
    }
    
    this.userSocketMap.set(decoded.sub.toString(), client.id);
    this.socketUserMap.set(client.id, decoded.sub.toString());
    this.logger.info(`User ${decoded.sub} connected with socket ${client.id}`);
  }

  handleDisconnect(client: Socket): void {

    const userId = this.socketUserMap.get(client.id);
    if (!userId) {
      return;
    }
    this.userSocketMap.delete(userId);
    this.socketUserMap.delete(client.id);

    this.logger.info(`User ${userId} disconnected with socket ${client.id}`);
  }

  sendNotification(notification: NotificationMessageDto): void {
    const usersToNotify = notification.createdBy 
    ? notification.userIds?.filter(id => id !== notification.createdBy?.toString()) ?? []
    : notification.userIds ?? [];
    
    for (const userId of usersToNotify) {
      const socketId = this.userSocketMap.get(userId);
      if (!socketId) {
        continue;
      }
      this.server.to(socketId).emit(notification.event, notification);
      this.logger.info(`Notification sent to user ${userId} with event ${notification.event}`);
    }
  }

}
