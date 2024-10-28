
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  BadGatewayException,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientError } from 'graphql-request';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ZodError } from 'zod';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        catchError(err => throwError(() => {
          console.error(err);
            if(err instanceof ClientError){
                // GraphQL Request Error
                return new BadGatewayException();
            }
            if(err instanceof ZodError){
                // Schema Validation Error
                return new BadGatewayException();
            }
            return new InternalServerErrorException();
        }),
      ));
  }
}
