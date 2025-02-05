import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLogInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { method, url } = context.switchToHttp().getRequest();
    this.logger.log(`[${method}] ${url}`);
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const end = Date.now();
        const response = context.switchToHttp().getResponse();
        const message = `Request ${method} ${url} took ${end - start}ms`;
        if (response.statusCode >= 400) {
          this.logger.error(message);
        } else {
          this.logger.log(message);
        }
      }),
    );
  }
}

