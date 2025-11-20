import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  
  private readonly logger = new Logger(RpcExceptionFilter.name);  


  catch(exception: RpcException | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.error(
      `[${request.method} ${request.url}] Error: ${exception.message}`,
      {
        exceptionType: exception?.constructor?.name || typeof exception,
        exception: JSON.stringify(exception, null, 2),
        stack: exception instanceof Error ? exception.stack : undefined,
        error:
          exception instanceof RpcException ? exception.getError() : exception,
        url: request.url,
        method: request.method,
        body: request.body,
      },
    );

    const expectionRCP = exception as RpcException;
    const errorPayload = expectionRCP.getError() as any;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Error desconhecido, tente novamente mais tarde";
    let errorType = "InternalServerError";

    if(errorPayload && errorPayload.statusCode && errorPayload.message){
      statusCode = errorPayload.statusCode;
      message = errorPayload.message;
      errorType = errorPayload.error || errorType;
    } else if(typeof errorPayload === 'string'){
      message = errorPayload;
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error: errorType,
      timestamp: new Date().toISOString(),
      path: request.url,
    })

  }
}
