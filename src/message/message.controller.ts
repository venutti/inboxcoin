import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreatePendingMessageDto } from './dto/create-pending-message.dto';
import { SubmitMessageTransactionDto } from './dto/submit-message-transaction.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

    @Get('/:publicKey')
    async getMessagesByUser(
      @Param('publicKey') publicKey: string,
      @Param('messageType') messageType?: 'sent' | 'received',
    ) {
      return await this.messageService.getMessagesByUser(publicKey, messageType);
    }


  @Post()
  async createPendingMessage(
    @Body() createPendingMessageDto: CreatePendingMessageDto,
  ) {
    return await this.messageService.createPendingMessage(
      createPendingMessageDto.fromPublicKey,
      createPendingMessageDto.toPublicKey,
      createPendingMessageDto.amount,
      createPendingMessageDto.message,
    );
  }

  @Post('/submit/:id')
  async submitMessageTransaction(
    @Param('id', ParseIntPipe) messageId: number,
    @Body() submitMessageTransactionDto: SubmitMessageTransactionDto,
  ) {
    return await this.messageService.submitMessageTransaction(
      messageId,
      submitMessageTransactionDto.transactionXdr,
    );
  }

  @Post('/cancel/:id')
  async cancelMessage(@Param('id', ParseIntPipe) messageId: number) {
    return await this.messageService.cancelMessage(messageId);
  }

  @Post('/receive/:id')
  async receiveMessage(@Param('id', ParseIntPipe) messageId: number) {
    return await this.messageService.receiveMessage(messageId);
  }
}
