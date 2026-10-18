import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  BadGatewayException,
  CallHandler,
  InternalServerErrorException,
  NotFoundException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ClientError } from 'graphql-request';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ZodError } from 'zod';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          if (err instanceof HttpException) {
            return err;
          }
          // GraphQL Request Error
          if (err instanceof ClientError) {
            if (err.response.data != null) {
              return new NotFoundException();
            }
            this.logger.error(
              `ClientError response: ${JSON.stringify(err.response, null, 2)}`,
            );
            return new BadGatewayException();
          }
          // Zod Schema Validation Error
          if (err instanceof ZodError) {
            this.logger.error(`Zod validation error: ${err.message}`, err.stack);
            return new BadGatewayException();
          }
          this.logger.error(
            err instanceof Error ? err.message : String(err),
            err instanceof Error ? err.stack : undefined,
          );
          return new InternalServerErrorException();
        }),
      ),
    );
  }
}
