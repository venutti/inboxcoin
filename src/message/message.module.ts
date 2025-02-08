import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { StellarModule } from 'src/stellar/stellar.module';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { UserModule } from 'src/user/user.module';
import { MessageListedMapper } from './mapper/message-listed.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), StellarModule, UserModule],
  providers: [MessageService, MessageListedMapper],
  controllers: [MessageController],
})
export class MessageModule {}
