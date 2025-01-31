import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const end = Date.now();
        const response = context.switchToHttp().getResponse();
        const { method, url } = context.switchToHttp().getRequest();
        const message = `Request ${method} ${url} took ${end - start}ms`;
        if (response.statusCode >= 400) {
          console.error(message);
        } else {
          console.log(message);
        }
      }),
    );
  }
}


