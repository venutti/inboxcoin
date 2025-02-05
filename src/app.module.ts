import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { StellarModule } from './stellar/stellar.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RequestLogInterceptor } from './requestLog.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UserModule,
    StellarModule,
  ],
  controllers: [AppController],
  providers: [AppService,  {
    provide: APP_INTERCEPTOR,
    useClass: RequestLogInterceptor,
  },],
})
export class AppModule {}
