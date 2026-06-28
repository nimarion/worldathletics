import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  BadGatewayException,
  CallHandler,
  InternalServerErrorException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { ClientError } from 'graphql-request';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ZodError } from 'zod';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
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
            console.log(
              'ClientError response:',
              JSON.stringify(err.response, null, 2),
            );
            return new BadGatewayException();
          }
          // Zod Schema Validation Error
          if (err instanceof ZodError) {
            console.log(err);
            return new BadGatewayException();
          }
          console.error(err);
          return new InternalServerErrorException();
        }),
      ),
    );
  }
}
