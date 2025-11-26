import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IoAdapter } from "@nestjs/platform-socket.io";
import path from "path";
import { ServerOptions } from "socket.io";


export class SocketIoAdapter extends IoAdapter {
    private configService: ConfigService;

    constructor(app: INestApplication) {
        super(app);
        
        const configService = app.get(ConfigService);
        this.configService = configService;
    }

    createIOServer(port: number, options?: ServerOptions) {
        const corsOrigin = this.configService.get<string>('CORS_ORIGIN') || '*';
        const allowedOrigins = corsOrigin.split(',').map(s => s.trim());

        const corsOptions = {
            ...options,
            cors: {
                origin: allowedOrigins,
                methods: ['GET', 'POST'],
                credentials: true,
            },
            path: '/socket.io',
            
        };

        const server = super.createIOServer(port, corsOptions);
        return server;
    }
    
}