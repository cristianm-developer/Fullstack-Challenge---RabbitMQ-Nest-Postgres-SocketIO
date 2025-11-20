import { Module, Global } from "@nestjs/common";
import { LoggerModule } from "pino-nestjs";
import { MicroserviceLoggingInterceptor } from "./pino-logging.interceptor.js";
import { PINO_SERVICE_NAME } from "../consts/service-name.js";
import { HttpToRpcInterceptor } from "./http-to-rpc.interceptor.js";

@Global()
@Module({})
export class MicroserviceInterceptorModule {
  static forRoot(serviceName: string) {
    return {
      module: MicroserviceInterceptorModule,
      imports: [
        LoggerModule.forRoot({
          pinoHttp: {
            base: { serviceName },
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
          }
        })
      ],
      providers: [
        {
          provide: PINO_SERVICE_NAME,
          useValue: serviceName,
        },
        MicroserviceLoggingInterceptor,
        HttpToRpcInterceptor        
      ],
      exports: [MicroserviceLoggingInterceptor, HttpToRpcInterceptor, PINO_SERVICE_NAME],
    };
  }
}

