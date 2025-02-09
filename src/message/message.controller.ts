import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreatePendingMessageDto } from './dto/create-pending-message.dto';
import { SubmitMessageTransactionDto } from './dto/submit-message-transaction.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({
    summary: 'Create a escrow account transaction, pending or user signature.',
  })
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

  @ApiOperation({
    summary: 'Submit a message transaction which has the user signature.',
  })
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

  @ApiOperation({
    summary: 'Create a cancel payment transaction, waiting for user signature.',
  })
  @Post('/cancel/:id')
  async cancelMessage(@Param('id', ParseIntPipe) messageId: number) {
    return await this.messageService.cancelMessage(messageId);
  }

  @ApiOperation({
    summary: 'Create a receive operation, waiting for user signature.',
  })
  @Post('/receive/:id')
  async receiveMessage(@Param('id', ParseIntPipe) messageId: number) {
    return await this.messageService.receiveMessage(messageId);
  }
}
