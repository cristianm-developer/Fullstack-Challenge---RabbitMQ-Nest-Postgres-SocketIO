import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpToRpcInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const contextType = context.getType();

    if (contextType !== 'rpc') {
      return next.handle();
    }

    return next.handle().pipe(
      catchError((err) => {
        if (err instanceof RpcException) {
          return throwError(() => err);
        }

        if (err instanceof HttpException) {
          const status = err.getStatus();
          const errorResponse = err.getResponse();
          const message =
            typeof errorResponse === 'string'
              ? errorResponse
              : (errorResponse as any).message || 'Error desconhecido';

          const errorPayload = {
            statusCode: status,
            message: Array.isArray(message) ? message.join(', ') : message,
            error: err.name,
          };

          return throwError(() => new RpcException(errorPayload));
        }

        return throwError(() => err);
      }),
    );
  }
}

