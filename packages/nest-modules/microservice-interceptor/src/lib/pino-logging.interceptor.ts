import {
  Inject,
  Injectable,
  Logger,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import { PINO_SERVICE_NAME } from "../consts/service-name.js";
import { catchError, tap, throwError } from "rxjs";
import { InjectPinoLogger, PinoLogger } from "pino-nestjs";

@Injectable()
export class MicroserviceLoggingInterceptor implements NestInterceptor {
  constructor(
    @InjectPinoLogger() private readonly logger: PinoLogger,
    @Inject(PINO_SERVICE_NAME) private readonly serviceName: string
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const contextType = context.getType();

    if (contextType !== "rpc") {
      return next.handle();
    }

    const handler = context.getHandler();
    const patternName = handler.name;
    const messagePayload = context.getArgByIndex(0);

    const idempotencyId = messagePayload?.idempotencyId || "N/A";
    const startTime = Date.now();

    this.logger.info(
      `[${this.serviceName}] Request started - Pattern: ${patternName}`,
      {
        pattern: patternName,
        idempotencyId,
        payload: messagePayload,
        transport: "RabbitMQ",
        timestamp: new Date().toISOString(),
      }
    );

    return next.handle().pipe(
      tap((result) => {
        const duration = Date.now() - startTime;
        this.logger.info(
          `[${this.serviceName}] Request completed - Pattern: ${patternName}`,
          {
            pattern: patternName,
            idempotencyId,
            duration_ms: duration,
            status: "SUCCESS",
            result: result,
            timestamp: new Date().toISOString(),
          }
        );
      }),
      catchError((err) => {
        const duration = Date.now() - startTime;
        this.logger.warn(
          `[${this.serviceName}] Request failed - Pattern: ${patternName}`,
          {
            pattern: patternName,
            idempotencyId,
            duration_ms: duration,
            status: "ERROR",
            error: {
              name: err.name,
              message: err.message,
              stack: err.stack,
            },
            timestamp: new Date().toISOString(),
          }
        );
        
        return throwError(() => err);
      })
    );
  }
}
